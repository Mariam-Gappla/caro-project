const AuctionOrder = require("../models/auctionOrder");
const Car = require("../models/car.js");
const User = require("../models/user.js");
const CarPlate = require("../models/carPlate.js");
const Wallet = require("../models/wallet");
const Invoice = require("../models/invoice");
const getNextOrderNumber = require("../controllers/counter");
const { sendNotification } = require("../configration/firebase.js");
const mongoose = require("mongoose");
const placeBid = async (req, res, next) => {
    try {
        const io = req.app.get("io");
        const lang = req.headers["accept-language"] || "ar";
        const { userId, amount, targetType, targetId } = req.body;

        // 1️⃣ جلب المحفظة والتأكد من الرصيد
        const wallet = await Wallet.findOne({ userId });
        if (!wallet || wallet.balance < amount) {
            return res.status(400).json({
                status: false,
                code: 400,
                message: lang === "ar"
                    ? "الرصيد غير كافٍ للمزايدة"
                    : "Insufficient balance to place bid",
            });
        }
        let modelResult;
        if (targetType == "Car") {
            modelResult = await Car.findOne({ _id: targetId })
        }
        else if (targetType == "CarPlate") {
            modelResult = await Car.findOne({ _id: targetId })
        }
        // 2️⃣ البحث عن المزاد الحالي على العنصر
        let auction = await AuctionOrder.findOne({
            targetId,
            targetType,
            fixedPrice: false
        });

        if (!auction) {
            // أول مزايدة على العنصر → إنشاء مزاد جديد
            auction = await AuctionOrder.create({
                targetId: new mongoose.Types.ObjectId(targetId),
                targetType,
                price: amount+modelResult.price,
                userId,
                fixedPrice: false,
                status: "pending"
            });
        } else {
            // المزاد موجود
            if (auction.status === "accepted") {
                return res.status(400).json({
                    status: false,
                    code: 400,
                    message: lang === "ar"
                        ? "لا يمكنك عمل مزايدة لقد تم قبول المزاد"
                        : "You cannot place a bid, the auction has been accepted",
                });
            }

            // التحقق من أن المزايدة أعلى من السعر الحالي
            if (amount <= auction.price) {
                return res.status(400).json({
                    status: false,
                    code: 400,
                    message: lang === "ar"
                        ? "يجب أن تكون المزايدة أعلى من السعر الحالي"
                        : "Bid must be higher than current price",
                });
            }

            // تحديث السعر والمستخدم الحالي
            auction.price += amount;
            auction.userId = userId;
            await auction.save();
        }

        // 3️⃣ خصم الرصيد من المحفظة
        wallet.balance -= amount;
        await wallet.save();

        // 4️⃣ إنشاء فاتورة
        const counter = await getNextOrderNumber("invoice");
        await Invoice.create({
            invoiceNumber: counter,
            userId,
            targetType: "User",
            targetId,
            orderType: "OrdersRentalOffice",
            orderId: auction._id,
            amount,
        });

        // 5️⃣ إرسال التحديث عبر Socket.IO
        io.emit("auctionUpdate", {
            auctionId: targetId,
            amount,
            userId,
            targetType,
        });

        // 6️⃣ إرسال Notification لصاحب العنصر
        let result = targetType === "Car"
            ? await Car.findById(targetId)
            : await CarPlate.findById(targetId);

        const ownerUser = await User.findById(result.userId);

        await sendNotification({
            target: ownerUser,
            targetType: "User",
            titleAr: "طلب جديد",
            titleEn: "New Order",
            messageAr: `لقد تلقيت طلبًا جديدًا من المستخدم ${ownerUser.username || 'عميل'}.`,
            messageEn: `You have received a new order from ${ownerUser.username || 'a customer'}.`,
            actionType: "order",
            orderId: auction._id,
            orderModel: "AuctionOrder",
            lang,
        });

        // 7️⃣ الرد على المستخدم
        res.status(200).json({
            status: true,
            code: 200,
            message: lang === "ar"
                ? "تم تقديم المزايدة بنجاح"
                : "Bid placed successfully",
            data: {
                auctionId: auction._id,
                currentPrice: auction.price,
                userId: auction.userId
            }
        });

    } catch (error) {
        next(error);
    }
};
const addOrder = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "ar";
        const { userId, amount, targetType, targetId } = req.body;

        // جلب المحفظة والتأكد من الرصيد
        const wallet = await Wallet.findOne({ userId });
        if (!wallet || wallet.balance < amount) {
            return res.status(400).json({
                status: false,
                code: 400,
                message: lang === "ar"
                    ? "الرصيد غير كافٍ للمزايدة"
                    : "Insufficient balance to place bid",
            });
        }
        const auction = await AuctionOrder.create({
            targetId: new mongoose.Types.ObjectId(targetId),
            targetType,
            price: amount,
            userId,
            fixedPrice: true
        });
        let result = targetType === "Car"
            ? await Car.findById(targetId)
            : await CarPlate.findById(targetId);

        const user = await User.findById(result.userId);

        await sendNotification({
            target: user,
            targetType: "User",
            titleAr: "طلب جديد",
            titleEn: "New Order",
            messageAr: `لقد تلقيت طلبًا جديدًا من المستخدم ${user.username || 'عميل'}.`,
            messageEn: `You have received a new order from ${user.username || 'a customer'}.`,
            actionType: "order",
            orderId: auction._id,
            orderModel: "AuctionOrder",
            lang,
        });
        res.status(200).json({
            status: true,
            code: 200,
            message: lang === "ar" ? "تم إضافة الطلب بنجاح" : "Order added successfully",
        });
    }
    catch (err) {
        next(err)
    }
}
const acceptOrRefusedAuctionOrder = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "ar";
        const status = req.query.status; // "accepted" أو "refused"
        const { orderId, targetType } = req.body; // targetType موجود

        // 1️⃣ التحقق من البيانات
        if (!orderId || !status || !targetType) {
            return res.status(400).json({
                status: false,
                code: 400,
                message: lang === "ar" ? "البيانات غير مكتملة" : "Incomplete data",
            });
        }

        // 2️⃣ جلب الأوردر
        const order = await AuctionOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({
                status: false,
                code: 404,
                message: lang === "ar" ? "الطلب غير موجود" : "Order not found",
            });
        }

        // 3️⃣ تحديث الحالة
        if (status === "accepted") {
            order.status = "accepted";
            if (targetType == "Car") {
                await Car.findOneAndUpdate({ _id: order.targetId }, { ended: true });

            }
            else if (targetType == "CarPlate") {
                await CarPlate.findOneAndUpdate({ _id: order.targetId }, { ended: true });
            }
        } else if (status === "refused") {
            order.status = "refused";
        } else {
            return res.status(400).json({
                status: false,
                code: 400,
                message: lang === "ar" ? "حالة غير صحيحة" : "Invalid status",
            });
        }

        await order.save();

        // 4️⃣ إرسال Notification لمقدم العرض (bidder)
        const bidderUser = await User.findById(order.userId);

        await sendNotification({
            target: bidderUser,
            targetType: "User",
            titleAr: status === "accepted" ? "تم قبول الطلب" : "تم رفض الطلب",
            titleEn: status === "accepted" ? "Order Accepted" : "Order Refused",
            messageAr: status === "accepted"
                ? `تم قبول مزايدتك بقيمة ${order.price}`
                : `تم رفض مزايدتك بقيمة ${order.price}`,
            messageEn: status === "accepted"
                ? `Your bid order of ${order.price} has been accepted`
                : `Your bid order of ${order.price} has been refused`,
            actionType: "order",
            orderId: order._id,
            orderModel: "AuctionOrder",
            targetType, // نحتفظ بالـ targetType
            lang,
        });

        // 5️⃣ الرد على المستخدم
        res.status(200).json({
            status: true,
            code: 200,
            message: status === "accepted"
                ? lang === "ar" ? "تم قبول الطلب" : "Order accepted"
                : lang === "ar" ? "تم رفض الطلب" : "Order refused",
        });

    } catch (err) {
        next(err);
    }
};




module.exports = { placeBid, addOrder, acceptOrRefusedAuctionOrder };
