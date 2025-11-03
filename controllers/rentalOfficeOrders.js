const rentalOfficeOrders = require("../models/rentalOfficeOrders");
const CarRental = require("../models/carRental");
const CarType = require("../models/carType");
const rentalOffice = require("../models/rentalOffice");
const { rentalOfficeOrderSchema, rentToOwnOrderSchema } = require("../validation/rentalOfficeOrders");
const counter = require("../models/counter");
const getNextOrderNumber = require("../controllers/counter");
const invoice = require("../models/invoice");
const CarArchive = require("../models/carArchive");
const SlavgePost = require("../models/slavgePost.js");
const Rating = require("../models/ratingForOrder");
const getMessages = require("../configration/getmessages");
const { sendNotification } = require("../configration/firebase.js");
const ProviderRating = require("../models/providerRating.js");
const serviceProviderOrder = require("../models/serviceProviderOrders");
const Name = require("../models/carName");
const Model = require("../models/carModel");
const path = require("path");
const mongoose = require('mongoose');
const fs = require("fs");
const User = require("../models/user");
const SalvagePost = require("../models/slavgePost.js");
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
const addOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const carId = req.params.id;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

        // ✅ جلب بيانات السيارة
        const car = await CarRental.findById(carId);
        if (!car) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: messages.rentalCar.existCar
            });
        }

        // ✅ معالجة موقع الاستلام (لو موجود)
        if (req.body['pickupLocation.lat'] && req.body['pickupLocation.long']) {
            req.body.pickupLocation = {
                lat: Number(req.body['pickupLocation.lat']),
                long: Number(req.body['pickupLocation.long'])
            };
            delete req.body['pickupLocation.lat'];
            delete req.body['pickupLocation.long'];
        }

        // ✅ تحديد نوع السكيمة حسب نوع السيارة
        const schema = car.rentalType === "weekly/daily"
            ? rentalOfficeOrderSchema(lang)
            : rentToOwnOrderSchema(lang);

        const { error } = schema.validate({
            userId,
            carId,
            ...req.body
        });

        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message
            });
        }

        // ✅ التحقق من التداخل في الحجز
        let overlappingOrder = null;

        if (car.rentalType === "weekly/daily") {
            const { startDate, endDate } = req.body;

            overlappingOrder = await rentalOfficeOrders.findOne({
                carId,
                ended: false, // ✅ استبعاد الطلبات المنتهية
                $or: [
                    {
                        startDate: { $lte: endDate },
                        endDate: { $gte: startDate }
                    }
                ]
            });
        } else {
            // ✅ نوع منتهي بالتمليك: ممنوع يتكرر حجزه
            overlappingOrder = await rentalOfficeOrders.findOne({ carId });
        }

        if (overlappingOrder) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: lang == "en"
                    ? "The selected period is already booked"
                    : "الفترة المختارة غير متاحة للحجز"
            });
        }

        // ✅ التحقق من رفع صورة الرخصة
        const imageFiles = req.files?.filter(f => f.fieldname === "licenseImage") || [];

        if (imageFiles.length === 0) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.order.licenseImageRequired
            });
        }

        if (imageFiles.length > 1) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.licenseImage.onlyOne
            });
        }

        const file = imageFiles[0];
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

        if (!allowedImageTypes.includes(file.mimetype)) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.order.licenseImage
            });
        }

        // ✅ حفظ الصورة فعليًا
        const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        const saveDir = '/var/www/images';
        const filePath = path.join(saveDir, fileName);

        if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, { recursive: true });
        }

        fs.writeFileSync(filePath, file.buffer);
        const fileUrl = `${BASE_URL}images/${fileName}`;

        // ✅ تجهيز بيانات الطلب
        const rentalOfficeId = car.rentalOfficeId;

        const orderData = {
            userId,
            rentalOfficeId,
            carId,
            licenseImage: fileUrl,
            paymentMethod: req.body.paymentMethod,
            deliveryType: req.body.deliveryType,
            pickupLocation: req.body.deliveryType === "delivery" ? req.body.pickupLocation : undefined,
            totalCost: req.body.totalCost,
            archivedCarId: carId
        };

        if (car.rentalType === "weekly/daily") {
            orderData.startDate = req.body.startDate;
            orderData.endDate = req.body.endDate;
            orderData.priceType = req.body.priceType;
        } else {
            orderData.startDate = req.body.startDate;
        }
        // ✅ إنشاء الطلب
        const order = await rentalOfficeOrders.create(orderData);
        console.log(rentalOfficeId);
        const Office = await rentalOffice.findById(rentalOfficeId);
        const user = await User.findById(userId);

        await sendNotification({
            target: Office, // المقدم هو اللي جاله الطلب
            targetType: "rentalOffice",
            titleAr: "طلب جديد",
            titleEn: "New Order",
            messageAr: `لقد تلقيت طلبًا جديدًا من المستخدم ${user.username || 'عميل'}.`,
            messageEn: `You have received a new order from ${user.username || 'a customer'}.`,
            actionType: "order",
            orderId: order._id,
            orderModel: "OrdersRentalOffice",
            lang,
        });


        return res.status(200).send({
            status: true,
            code: 200,
            message: messages.order.addOrder
        });

    } catch (err) {
        next(err);
    }
}
const updateOrderStatuses = async (orders) => {
    const now = new Date();

    const updatePromises = orders.map(async (order) => {
        const rentalType = order.carId?.rentalType;

        if (rentalType === "weekly/daily") {
            if (now > order.endDate) {
                order.ended = true;
                return order.save();
            }
        } else if (rentalType === "rent to own") {
            const ownershipPeriod = Number(order.ownershipAfter);
            const createdAt = new Date(order.createdAt);
            const diffInDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

            if (diffInDays > ownershipPeriod) {
                order.ended = true;
                return order.save();
            }
        }

        return null;
    });

    await Promise.all(updatePromises);
}
const ordersForRentalOfficewithstatus = async (req, res, next) => {
    try {
        const rentalOfficeId = req.user.id;
        const status = req.query.status;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);

        const paymentStatusTranslations = {
            en: { ended: "Ended", inProgress: "inProgress", paid: "Paid" },
            ar: { ended: "منتهيه", inProgress: "بأنتظار الدفع", paid: "تم الدفع" }
        };

        // Step 1: تحديث الحالات القديمة
        const orders = await rentalOfficeOrder.find({ rentalOfficeId });
        updateOrderStatuses(orders);

        // Step 2: تجهيز الفلتر
        let filters = { rentalOfficeId };
        if (status === "accepted") {
            filters.status = "accepted";
            filters.ended = false;
        } else if (status === "ended") {
            filters.ended = true;
            filters.status = "accepted";
        }

        const totalOrders = await rentalOfficeOrder.countDocuments(filters);

        const ordersUpdated = await rentalOfficeOrder
            .find(filters)
            .skip(skip)
            .limit(limit)
            .lean();

        const formattedOrders = await Promise.all(
            ordersUpdated.map(async (order) => {
                let carData = await CarRental.findById(order.carId).lean();

                // ✅ لو العربية مش موجودة في الجدول الأساسي
                if (!carData) {
                    const archivedCar = await CarArchive.findOne({ originalCarId: order.carId }).lean();
                    if (archivedCar) {
                        carData = archivedCar;
                    }
                }

                // ✅ لو لسه مفيش عربية حتى بعد الأرشيف
                if (!carData) {
                    return null; // تجاهل الطلب
                }

                // جلب الاسم والموديل
                const name = await Name.findById(carData.nameId).lean();
                const model = await Model.findById(carData.modelId).lean();

                const paymentStatus = order.ended ? "ended" : order.paymentStatus;
                const paymentStatusText = paymentStatusTranslations[lang][paymentStatus] || "";

                if (carData.rentalType === "weekly/daily") {
                    return {
                        id: order._id,
                        title: lang === "ar"
                            ? `تأجير سيارة ${name?.carName?.ar || ""} ${model?.model?.ar || ""}`
                            : `Renting a car ${name?.carName?.en || ""} ${model?.model?.en || ""}`,
                        startDate: order.startDate,
                        endDate: order.endDate,
                        rentalType: carData.rentalType,
                        city: carData.city,
                        totalCost: order.totalCost,
                        paymentStatus,
                        paymentStatusText
                    };
                } else {
                    return {
                        id: order._id,
                        title: lang === "ar"
                            ? `تملك سيارة ${name?.carName?.ar || ""} ${model?.model?.ar || ""}`
                            : `Owning a car ${name?.carName?.en || ""} ${model?.model?.en || ""}`,
                        ownershipPeriod: carData.ownershipPeriod,
                        rentalType: carData.rentalType,
                        totalCost: order.totalCost,
                        city: carData.city,
                        paymentStatus,
                        paymentStatusText
                    };
                }
            })
        );

        // إزالة أي طلبات رجعت null
        const cleanedOrders = formattedOrders.filter(Boolean);

        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en"
                ? "Your request has been completed successfully"
                : "تمت معالجة الطلب بنجاح",
            data: {
                orders: cleanedOrders,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalOrders / limit),
                }
            }
        });

    } catch (err) {
        next(err);
    }
}
const getOrdersStatisticsByWeekDay = async (req, res, next) => {
    try {
        const rentalOfficeId = req.user.id;
        const lang = req.headers['accept-language'] || 'en';

        // ناخد الشهر والسنة من الكويري أو نستخدم الشهر الحالي
        let { month, year } = req.query;

        // لو مفيش month أو year نجيب القيم الحالية
        const currentDate = new Date();
        month = month ? parseInt(month) : currentDate.getMonth() + 1; // JS بيبدأ من 0
        year = year ? parseInt(year) : currentDate.getFullYear();

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        const result = await rentalOfficeOrders.aggregate([
            {
                $match: {
                    rentalOfficeId: new mongoose.Types.ObjectId(String(rentalOfficeId)),
                    date: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $addFields: {
                    weekday: { $dayOfWeek: "$date" }
                }
            },
            {
                $group: {
                    _id: "$weekday",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const days = {
            1: "Sunday",
            2: "Monday",
            3: "Tuesday",
            4: "Wednesday",
            5: "Thursday",
            6: "Friday",
            7: "Saturday"
        };

        const statsMap = {};
        result.forEach(r => {
            statsMap[r._id] = r.count;
        });

        const stats = Object.entries(days).map(([key, value]) => ({
            day: value,
            count: statsMap[key] || 0
        }));

        res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en"
                ? "Your request has been completed successfully"
                : "تمت معالجة الطلب بنجاح",
            data: {
                report: stats,
            }
        });

    } catch (err) {
        next(err);
    }
};
const getReportData = async (req, res, next) => {
    try {
        const rentalOfficeId = req.user.id;
        const lang = req.headers['accept-language'] || 'en';
        const fullOrders = await rentalOfficeOrders.find({ rentalOfficeId });
        const cars = await CarRental.find({ rentalOfficeId });
        const rating = await Rating.find({ rentalOfficeId });
        // الإيرادات
        const revenueResult = await rentalOfficeOrder.aggregate([
            {
                $match: {
                    rentalOfficeId: new mongoose.Types.ObjectId(String(rentalOfficeId))
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalCost" }
                }
            }
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;
        res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en" ? "Your request has been completed successfully" : "تمت معالجة الطلب بنجاح",
            data: {
                orders: fullOrders.length,
                cars: cars.length,
                rating: rating.length,
                revenu: totalRevenue

            }
        });


    }
    catch (error) {
        next(error)
    }
}
const getOrderById = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);

        const paymentStatusTranslations = {
            en: {
                ended: "Ended",
                inProgress: "inProgress",
                paid: "Paid"
            },
            ar: {
                ended: "منتهي",
                inProgress: "بأنتظار الدفع",
                paid: "تم الدفع"
            }
        };

        if (!orderId) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.order.orderId
            });
        }

        // جلب الطلب بدون populate عشان نحتفظ بـ carId كـ ObjectId
        const rawOrder = await rentalOfficeOrders.findById(orderId).lean();

        if (!rawOrder) {
            return res.status(404).send({
                status: false,
                code: 404,
                message: lang === "ar" ? "الطلب غير موجود" : "Order not found"
            });
        }

        // نجيب العربية من الجدول الأساسي باستخدام الـ ObjectId الأصلي
        let carData = await CarRental.findById(rawOrder.carId);

        if (!carData) {
            // لو مش موجودة في carRental نبحث في الأرشيف
            carData = await CarArchive.findOne({ originalCarId: rawOrder.carId });
        }

        if (!carData) {
            return res.status(404).send({
                status: false,
                code: 404,
                message: lang === "ar" ? "السيارة غير موجودة" : "Car not found"
            });
        }

        const name = await Name.findById(carData.nameId);

        // هنا كما طلبتي، نرجع object كامل للموديل زي ما كان عندك
        const model = await Model.findById(carData.modelId);

        const paymentStatus = rawOrder.ended ? "ended" : rawOrder.paymentStatus;
        const paymentStatusText = paymentStatusTranslations[lang][paymentStatus] || "";

        let formattedOrder;

        if (carData.rentalType === "weekly/daily") {
            formattedOrder = {
                title: lang === "ar"
                    ? `تأجير سيارة ${name?.carName?.ar || ""} ${model?.model?.ar || ""}`
                    : `Renting a car ${name?.carName?.en || ""} ${model?.model?.en || ""}`,
                rentalType: carData.rentalType,
                images: carData.images,
                carDescription: carData.carDescription,
                carModel: lang == "en" ? model.model.en : model.model.ar,   // رجعنا الـ model كامل هنا
                city: carData.city,
                odoMeter: carData.odoMeter,
                licensePlateNumber: carData.licensePlateNumber,
                startDate: rawOrder.startDate,
                endDate: rawOrder.endDate,
                pickupLocation: rawOrder.pickupLocation || "",
                licenseImage: rawOrder.licenseImage,
                priceType: rawOrder.priceType,
                paymentStatus,
                paymentStatusText,
                price:
                    rawOrder.priceType === "open_km"
                        ? carData.pricePerExtraKilometer
                        : carData.pricePerFreeKilometer,
                video: carData.videoCar || ""
            };
        } else if (carData.rentalType === "rent to own") {
            console.log(carData.monthlyPaymentde)
            formattedOrder = {
                title: lang === "ar"
                    ? `تملك سيارة ${name?.carName?.ar || ""} ${model?.model?.ar || ""}`
                    : `Owning a car ${name?.carName?.en || ""} ${model?.model?.en || ""}`,
                rentalType: carData.rentalType,
                images: carData.images,
                carDescription: carData.carDescription,
                ownershipPeriod: carData.ownershipPeriod,
                price: carData.carPrice,
                finalPayment: carData.finalPayment,
                carModel: lang == "en" ? model.model.en : model.model.ar,
                city: carData.city,
                monthlyPayment: carData.monthlyPayment,
                odoMeter: carData.odoMeter,
                licensePlateNumber: carData.licensePlateNumber,
                startDate: rawOrder.startDate,
                location: rawOrder.pickupLocation || "",
                paymentStatus,
                paymentStatusText,
                licenseImage: rawOrder.licenseImage,
                video: carData.videoCar || ""
            };
        }

        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en"
                ? "Your request has been completed successfully"
                : "تمت معالجة الطلب بنجاح",
            data: formattedOrder
        });
    } catch (error) {
        next(error);
    }
};
const acceptorder = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const status = req.query.status
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
        if (status == "accepted") {

            const videoFiles = req.files.filter(f => f.fieldname === "video");
            if (!req.files) {
                return res.status(400).send({
                    status: false,
                    code: 400,
                    message: messages.rentalCar.video
                });

            }

            if (videoFiles.length === 0) {
                return res.status(400).send({
                    status: false,
                    code: 400,
                    message: messages.rentalCar.video
                });
            }

            if (videoFiles.length > 1) {
                return res.status(400).send({
                    status: false,
                    code: 400,
                    message: messages.rentalCar.onlyOneVideo
                });
            }

            const file = videoFiles[0];

            const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];

            if (!allowedVideoTypes.includes(file.mimetype)) {
                return res.status(400).send({
                    status: false,
                    code: 400,
                    message: messages.rentalCar.invalidFormat
                });
            }

            const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

            // نخلي المسار مطلق على السيرفر
            const saveDir = '/var/www/images';
            const filePath = path.join(saveDir, fileName);

            if (!fs.existsSync(saveDir)) {
                fs.mkdirSync(saveDir, { recursive: true });
            }

            fs.writeFileSync(filePath, file.buffer);

            console.log("Saved file at:", filePath);

            // نرجع لينك مباشر يوصل من المتصفح
            const fileUrl = `${BASE_URL}images/${fileName}`;
            const rentalOfficeId = req.user.id;
            const order = await rentalOfficeOrders.findByIdAndUpdate(
                { _id: orderId },
                { status: status },
                { new: true }
            );

            if (!order) {
                return res.status(400).send({
                    status: false,
                    code: 400,
                    message: messages.order.notExist
                });
            }

            const updatedCar = await CarRental.findByIdAndUpdate(
                { _id: order.carId },
                { videoCar: fileUrl },
                { new: true }
            );
            const user = await User.findById(order.userId);
            const counter = await getNextOrderNumber("invoice");
            await invoice.create({
                invoiceNumber: counter,
                userId: order.userId,
                targetType: "rentalOffice",
                targetId: rentalOfficeId,
                orderType: "OrdersRentalOffice",
                orderId: order._id,
                amount: order.totalCost,
            });
            await sendNotification({
                target: user, // المستخدم اللي قدم الطلب
                targetType: "User",
                titleAr: "تمت الموافقة على طلبك",
                titleEn: "Your order has been approved",
                messageAr: `تمت الموافقة على طلبك رقم ${order._id} من قبل ${user.username || 'مستخدم'}`,
                messageEn: `Your order #${order._id} has been approved by ${user.username || 'the user'}`,
                actionType: "order",
                orderId: order._id,
                orderModel: "OrdersRentalOffice", // أو OrdersRentalOffice حسب نوع الطلب
                lang: lang, // لو المستخدم عنده لغة محفوظة
            });
            return res.status(200).send({
                status: true,
                code: 200,
                message: messages.order.acceptedSuccess || "تم قبول الطلب ورفع فيديو السيارة بنجاح",
            });
        }
        else {
            const order = await rentalOfficeOrders.findByIdAndUpdate(
                { _id: orderId },
                { status: status },
                { new: true }
            );

            if (!order) {
                return res.status(400).send({
                    status: false,
                    code: 400,
                    message: messages.order.notExist
                });
            }
            const user = await User.findById(order.userId);
            await sendNotification({
                target: user,
                targetType: "User",
                titleAr: "تم رفض طلبك",
                titleEn: "Your order has been rejected",
                messageAr: `تم رفض طلبك رقم ${order._id} من قبل ${provider.username || 'المستخدم'}`,
                messageEn: `Your order #${order._id} has been rejected by ${provider.username || 'the user'}`,
                actionType: "orderRejected",
                orderId: order._id,
                orderModel: "ServiceProviderOrder", // أو OrdersRentalOffice حسب نوع الطلب
                lang: lang,
            });
            return res.status(200).send({
                status: true,
                code: 200,
                message: lang == "en" ? "order refused" : "تم رفض الطلب",
            });
        }





    } catch (error) {
        next(error);
    }
};
const getOrders = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const rentalOfficeId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // نجيب كل الإحصائيات في وقت واحد
        const [deliveredCount, pendingCount, expiredCount] = await Promise.all([
            rentalOfficeOrders.countDocuments({ isDelivered: true, rentalOfficeId }),
            rentalOfficeOrders.countDocuments({ status: "pending", rentalOfficeId }),
            rentalOfficeOrders.countDocuments({ endDate: { $lt: today }, rentalOfficeId })
        ]);

        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en"
                ? "Your request has been completed successfully"
                : "تمت معالجة الطلب بنجاح",
            data: {
                deliveredOrders: deliveredCount,
                pendingOrders: pendingCount,
                expiredOrders: expiredCount
            }
        });
    } catch (error) {
        next(error);
    }
};
const getBookedDays = async (req, res, next) => {
    try {
        const carId = req.params.carId;
        const year = parseInt(req.query.year);
        const month = parseInt(req.query.month); // من 1 إلى 12
        const lang = req.headers['accept-language'] || 'en';
        if (!year || !month || month < 1 || month > 12) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: "Invalid year or month",
            });
        }

        // احسب أول وآخر يوم في الشهر المطلوب
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59); // آخر يوم في الشهر

        // هات كل الحجوزات الخاصة بالعربية في هذا الشهر
        const orders = await rentalOfficeOrders.find({
            carId,
            $or: [
                {
                    startDate: { $lte: endOfMonth },
                    endDate: { $gte: startOfMonth },
                }
            ]
        });

        // استخرج كل الأيام المحجوزة داخل كل حجز
        const bookedDays = [];

        orders.forEach(order => {
            let currentDate = new Date(order.startDate);
            const endDate = new Date(order.endDate);

            while (currentDate <= endDate) {
                if (
                    currentDate.getFullYear() === year &&
                    currentDate.getMonth() === month - 1
                ) {
                    // ضيف اليوم بصيغة yyyy-mm-dd
                    bookedDays.push(currentDate.toISOString().split("T")[0]);
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });

        return res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en" ? "Your request has been completed successfully" : "تمت معالجة الطلب بنجاح",
            data: {
                bookedDays
            }
        });

    } catch (error) {
        next(error);
    }
};
const getOrdersByRentalOffice = async (req, res, next) => {
    try {
        const rentalOfficeId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const lang = req.headers['accept-language'] || 'en';
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const messages = getMessages(lang);

        const totalOrders = await rentalOfficeOrders.countDocuments({ rentalOfficeId, status: "pending" });

        const orders = await rentalOfficeOrders.find({ rentalOfficeId, status: "pending" })
            .select("carId startDate endDate priceType deliveryType paymentMethod") // ✅ هنجيب بس اللي محتاجينه
            .skip(skip)
            .limit(limit)
            .lean();

        if (!orders.length) {
            return res.status(200).send({
                status: true,
                code: 200,
                message: messages.order.existOrders || "لا توجد طلبات",
                data: {
                    orders: [],
                    pagination: { currentPage: page, totalPages: 0 }
                }
            });
        }

        const BATCH_SIZE = 50; // عدد الطلبات في كل دفعة
        const formattedOrders = [];

        for (let i = 0; i < orders.length; i += BATCH_SIZE) {
            const batch = orders.slice(i, i + BATCH_SIZE);

            const batchResults = await Promise.all(batch.map(async order => {
                let car = await CarRental.findById(order.carId).lean();

                if (!car) {
                    car = await CarArchive.findOne({ originalCarId: order.carId }).lean();
                    if (!car) return null;
                }

                const name = await Name.findById(car.nameId).lean();
                const model = await Model.findById(car.modelId).lean();

                if (car.rentalType === "weekly/daily") {
                    const diffInDays = Math.ceil(
                        (new Date(order.endDate) - new Date(order.startDate)) / (1000 * 60 * 60 * 24)
                    );

                    return {
                        id: order._id,
                        images: car.images,
                        title: lang === "ar"
                            ? `تأجير سيارة ${name?.carName.ar || ""} ${model?.model.ar || ""}`
                            : `Renting a car ${name?.carName.en || ""} ${model?.model.en || ""}`,
                        orderType: "nonOwnership",
                        licensePlateNumber: car.licensePlateNumber,
                        rentalDays: diffInDays,
                        startDate: order.startDate,
                        endDate: order.endDate,
                        priceType: order.priceType,
                        price:
                            order.priceType === "open_km"
                                ? car.freeKilometers * car.pricePerFreeKilometer
                                : car.pricePerExtraKilometer,
                        deliveryType: order.deliveryType,
                        paymentMethod: order.paymentMethod,
                        carModel: lang === "ar" ? model?.model.ar : model?.model.en || " ",
                    };
                } else {
                    return {
                        id: order._id,
                        images: car.images,
                        title: lang === "ar"
                            ? `تملك سيارة ${name?.carName.ar || ""} ${model?.model.ar || ""}`
                            : `Owning a car ${name?.carName.en || ""} ${model?.model.en || ""}`,
                        orderType: "Ownership",
                        licensePlateNumber: car.licensePlateNumber,
                        monthlyPayment: car.monthlyPayment,
                        odoMeter: car.odoMeter,
                        price: car.carPrice,
                        carModel: lang === "ar" ? model?.model.ar : model?.model.en || " ",
                        deliveryType: order.deliveryType,
                        paymentMethod: order.paymentMethod
                    };
                }
            }));

            formattedOrders.push(...batchResults.filter(o => o !== null));
        }

        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en"
                ? "Your request has been completed successfully"
                : "تمت معالجة الطلب بنجاح",
            data: {
                orders: formattedOrders,
                pagination: {
                    page: page,
                    totalPages: Math.ceil(totalOrders / limit),
                }
            }
        });

    } catch (error) {
        next(error);
    }
};
const endOrder = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const orderId = req.params.id;
        const rentalOfficeId = req.user.id;
        const order = await rentalOfficeOrders.findOne({ _id: orderId });
        if (order.paymentMethod == "cash") {
            order.ended = true
            await order.save();
            const count = await counter.findOneAndUpdate(
                { name: "invoice" },
                { $inc: { seq: 1 } },
                { returnDocument: "after", upsert: true }
            );

            if (!count) {
                return res.status(500).json({ message: "Counter not found" });
            }

            await invoice.create({
                invoiceNumber: count.seq,
                userId: order.userId,
                rentalOfficeId,
                orderId,
                amount: order.totalCost,
            });

            return res.status(200).send({
                status: true,
                code: 200,
                message: lang == "en" ? "order ended succesfully" : "تم انهاء الاوردر بنجاح"
            })
        }
        else if (order.paymentMethod == "online") {
            if (order.paymentStatus == "paid") {
                order.ended = true
                await order.save();
                const count = await counter.findOneAndUpdate(
                    { name: "invoice" },
                    { $inc: { seq: 1 } },
                    { returnDocument: "after", upsert: true }
                );

                if (!count) {
                    return res.status(500).json({ message: "Counter not found" });
                }

                await invoice.create({
                    invoiceNumber: count.seq,
                    userId: order.userId,
                    rentalOfficeId,
                    orderId,
                    amount: order.totalCost,
                });
                return res.status(200).send({
                    status: true,
                    code: 200,
                    message: lang == "en" ? "order ended succesfully" : "تم انهاء الاوردر بنجاح"
                })
            }
            else {
                return res.status(200).send({
                    status: true,
                    code: 200,
                    message: lang == "en" ? "you can not end order because order unpaid" : "لا تستطيع انهاء الاوردر لانه لم يتم الدفع"
                })

            }
        }
    }
    catch (error) {
        next(error)
    }
}
const getAllUserOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const lang = req.headers['accept-language'] || 'en';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status;
        let filterrentalOffice = { userId };
        let filterServiceProvider = { userId }
        let slavePosts = [];
        let filterSlavge = { userId };
        if (status == "paid") {
            filterrentalOffice.status = "accepted";
            filterServiceProvider.status = "accepted";
        }
        if (status == "inProgress") {
            filterrentalOffice.paymentStatus = "inProgress"
            filterrentalOffice.status = "pending";
            filterServiceProvider.status = "pending";
            filterServiceProvider.paymentStatus = "inProgress";
            filterSlavge.ended = false
            slavePosts = await SlavgePost.find(filterSlavge).populate("providerId").lean();
        }
        if (status == "ended") {
            filterrentalOffice.ended = true
            filterServiceProvider.ended = true
            filterSlavge.ended = true
            slavePosts = await SlavgePost.find(filterSlavge).populate("providerId").lean();
        }
        const messages = getMessages(lang);

        const paymentStatusTranslations = {
            en: { ended: "Ended", inProgress: "inProgress", paid: "Paid" },
            ar: { ended: "منتهيه", inProgress: "بأنتظار الدفع", paid: "تم الدفع" }
        };

        // 🟢 1. طلبات المستخدم من مكتب التأجير
        const rentalOrders = await rentalOfficeOrders.find(filterrentalOffice).lean();
        updateOrderStatuses(rentalOrders);

        const rentalFormatted = await Promise.all(
            rentalOrders.map(async (order) => {
                let carData = await CarRental.findById(order.carId).populate("modelId").lean();
                if (!carData) {
                    const archivedCar = await CarArchive.findOne({ originalCarId: order.carId }).populate("modelId").lean();
                    if (archivedCar) carData = archivedCar;
                }
                if (!carData) return null;

                const paymentStatus = order.ended ? "ended" : order.paymentStatus;
                const paymentStatusText = paymentStatusTranslations[lang][paymentStatus] || "";

                // ✅ تفريق بين التأجير اليومي/الأسبوعي والتمليك
                if (carData.rentalType === "weekly/daily") {
                    return {
                        id: order._id,
                        type: "rentalOffice",
                        title: carData.title,
                        rentalType: carData.rentalType,
                        startDate: order.startDate,
                        endDate: order.endDate,
                        deliveryType: order.deliveryType,
                        paymentMethod: order.paymentMethod,
                        priceType: order.priceType,
                        model: carData.modelId.model[lang],
                        city: carData.city,
                        totalCost: order.totalCost,
                        paymentStatus,
                        paymentStatusText,
                        createdAt: order.createdAt
                    };
                } else {
                    return {
                        id: order._id,
                        type: "rentalOffice",
                        title: carData.title,
                        ownershipPeriod: carData.ownershipPeriod,
                        rentalType: carData.rentalType,
                        city: carData.city,
                        deliveryType: order.deliveryType,
                        monthlyPayment: carData.monthlyPayment,
                        carPrice: carData.carPrice,
                        paymentMethod: order.paymentMethod,
                        totalCost: order.totalCost,
                        paymentStatus,
                        paymentStatusText,
                        createdAt: order.createdAt
                    };
                }
            })
        );

        // 🟣 2. طلبات المستخدم من مزود الخدمة
        const providerOrders = await serviceProviderOrder
            .find(filterServiceProvider).populate("providerId")
            .lean();
        let distance;
        let distanceDrop;
        const providerFormatted = await Promise.all(
            providerOrders.map(async (order) => {
                const paymentStatusText =
                    paymentStatusTranslations[lang][order.paymentStatus] || "";
                let averageRating = null;
                const reviews = await ProviderRating.find({ serviceProviderId: order.providerId });
                if (reviews.length > 0) {
                    const total = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
                    averageRating = (total / reviews.length).toFixed(1);
                }
                
                if (order.serviceType =='winch' && order.providerId) {
                    distance = haversineDistance(
                        order.providerId.location.lat,
                        order.providerId.location.long,
                        order.location.lat,
                        order.location.long
                    ).toFixed(2);
                    distanceDrop = haversineDistance(
                        order.providerId.location.lat,
                        order.providerId.location.long,
                        order.dropoffLocation.lat,
                        order.dropoffLocation.long
                    ).toFixed(2);
                }
                else if(order.providerId) {
                    distance = haversineDistance(
                        order.providerId.location.lat,
                        order.providerId.location.long,
                        order.location.lat,
                        order.location.long
                    ).toFixed(2);
                }
            
                return {
                    id: order._id,
                    type: "serviceProvider",
                    serviceType: order.serviceType,
                    price: order.price,
                    details: order.details,
                    paymentType: order.paymentType,
                    image: order.image,
                    location: order.location,
                    locationText: order.locationText,
                    dropoffLocation: order.dropoffLocation,
                    dropoffLocationText: order.dropoffLocationText,
                    paymentStatus: order.paymentStatus,
                    paymentStatusText,
                    distanceToProvider:order.providerId ? distance:undefined,
                    distanceToDrop:order.providerId ?distanceDrop:undefined,
                    createdAt: order.createdAt,
                    userData: order.providerId ? {
                        username: order.providerId.username,
                        image: order.providerId.image,
                        rating: averageRating
                    } : undefined
                };
            })
        );


        const slavePostsFormatted = await Promise.all(
            slavePosts.map(async (post) => {
                return {
                    id: post._id,
                    type: "slavePost",
                    title: post.title,
                    image: post.images[0],
                    locationText: post.locationText,
                    details: post.details,
                    createdAt: post.createdAt,
                    providerData: post.providerId ? {
                        username: post.providerId.username,
                        image: post.providerId.image
                    } : undefined
                };
            })
        );

        // 🟡 3. دمج وترتيب الطلبات (الأحدث أولًا)
        const allOrders = [...rentalFormatted, ...providerFormatted, ...slavePostsFormatted]
            .filter(Boolean)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 🧮 pagination يدوي بعد الدمج
        const paginated = allOrders.slice(skip, skip + limit);
        const totalPages = Math.ceil(allOrders.length / limit);

        return res.status(200).send({
            status: true,
            code: 200,
            message:
                lang === "ar"
                    ? "تم استرجاع جميع الطلبات بنجاح"
                    : "All orders retrieved successfully",
            data: {
                orders: paginated,
                pagination: {
                    page: paginated ? page : 0,
                    totalPages
                }
            }
        });

    } catch (error) {
        next(error);
    }
};
const cancelOrder = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const { id, type } = req.body
        let Model;
        if (type == "salvagePost") {
            Model = SalvagePost
        }
        if (type == "serviceProvider") {
            Model = serviceProviderOrder
        }
        await Model.findByIdAndDelete(id);
        return res.status(200).send({
            code: 200,
            status: true,
            message: lang == "en" ? "order canceled successfuly" : "تم الغاء الاوردر بنجاح"
        })

    }
    catch (err) {
        next(err)
    }
}



module.exports = {
    addOrder,
    updateOrderStatuses,
    ordersForRentalOfficewithstatus,
    getOrdersStatisticsByWeekDay,
    getOrderById,
    acceptorder,
    getOrders,
    getBookedDays,
    getOrdersByRentalOffice,
    endOrder,
    getReportData,
    getAllUserOrders,
    cancelOrder
}








