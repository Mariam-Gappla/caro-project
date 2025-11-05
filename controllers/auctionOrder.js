const AuctionOrder = require("../models/auctionOrder");
const Wallet = require("../models/wallet");
const Invoice = require("../models/invoice");
const getNextOrderNumber = require("../controllers/counter");
const mongoose = require("mongoose");
const placeBid = async (req, res, next) => {
    try {
        // هنا io بيتجاب من السيرفر نفسه
        const io = req.app.get("io");
        const lang = req.headers["accept-language"] || "ar";
        const { userId, amount, targetType, targetId } = req.body;

        const auction = await AuctionOrder.findOne({ targetId: new mongoose.Types.ObjectId(targetId), targetType });
        console.log("Target ID from request:", targetId);
console.log("Target Type from request:", targetType);
console.log("Auctions in DB with this type:", await AuctionOrder.find({ targetType }));

        if (!auction) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === "ar" ? "العنصر غير موجود" : "Item not found",
            });
        }

        const wallet = await Wallet.findOne({ userId });
        if (!wallet || wallet.balance < amount) {
            return res.status(400).send({
                status: false,
                code: 400,
                message:
                    lang === "ar"
                        ? "الرصيد غير كافٍ للمزايدة"
                        : "Insufficient balance to place bid",
            });
        }

        if (amount > auction.price) {
            auction.price = amount;
            auction.userId = userId;
        }

        await auction.save();
        wallet.balance -= amount;
        await wallet.save();

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

        // نرسل التحديث لكل العملاء عبر Socket.IO
        io.emit("auctionUpdate", {
            auctionId: targetId,
            amount,
            userId,
            targetType,
        });

        res.status(200).send({
            status: true,
            code: 200,
            message:
                lang === "ar"
                    ? "تم تقديم المزايدة بنجاح"
                    : "Bid placed successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { placeBid };
