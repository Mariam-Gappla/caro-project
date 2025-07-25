const rentalOfficeOrders = require("../models/rentalOfficeOrders");
const CarRental = require("../models/carRental");
const rentalOfficeOrder = require("../models/rentalOfficeOrders");
const { rentalOfficeOrderSchema, rentToOwnOrderSchema } = require("../validation/rentalOfficeOrders");
const Revenu = require("../models/invoice");
const Rating = require("../models/ratingForOrder");
const getMessages = require("../configration/getmessages");
const Name = require("../models/carName");
const Model = require("../models/carType");
const path = require("path");
const mongoose = require('mongoose');
const fs = require("fs");
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
        const fileName = `${Date.now()}-${file.originalname}`;
        const saveDir = path.join(__dirname, '../images');
        const filePath = path.join(saveDir, fileName);

        if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, { recursive: true });
        }

        fs.writeFileSync(filePath, file.buffer);
        const fileUrl = `${BASE_URL}/images/${fileName}`;

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
            totalCost: req.body.totalCost
        };

        if (car.rentalType === "weekly/daily") {
            orderData.startDate = req.body.startDate;
            orderData.endDate = req.body.endDate;
            orderData.priceType = req.body.priceType;
        } else {
            orderData.startDate = req.body.startDate;
        }

        // ✅ إنشاء الطلب
        await rentalOfficeOrders.create(orderData);

        return res.status(200).send({
            status: true,
            code: 200,
            message: messages.order.addOrder
        });

    } catch (err) {
        next(err);
    }
};
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
};
const ordersForRentalOfficewithstatus = async (req, res, next) => {
    try {
        const rentalOfficeId = req.user.id;
        const status = req.query.status;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        const now = new Date();

        // Step 1: تحديث الحالات القديمة
        const orders = await rentalOfficeOrder.find({ rentalOfficeId, isAvailable: true }).populate('carId');

        updateOrderStatuses(orders)

        // Step 2: تجهيز الفلتر للطلبات المطلوبة
        let filters = { rentalOfficeId, isAvailable: true };

        if (status === "pending") {
            filters.status = "pending";
        } else if (status === "accepted") {
            filters.status = "accepted";
        } else if (status === "ended") {
            filters.ended = true;
        }

        const totalOrders = await rentalOfficeOrder.countDocuments(filters);

        const ordersupdated = await rentalOfficeOrder
            .find(filters)
            .populate('carId')
            .skip(skip)
            .limit(limit)
            .lean();

        const formattedOrders = await Promise.all(
            ordersupdated.map(async (order) => {
                const { carId, ...rest } = order;

                // تأكد من أن name و model يتم جلبهم بشكل صحيح
                const name = await Name.findOne({ _id: carId.nameId });
                const model = await Model.findOne({ _id: carId.modelId });

                if (carId?.rentalType === "weekly/daily") {
                    return {
                        id: rest._id,
                        title: lang === "ar"
                            ? `تأجير سيارة ${name?.carName || ""} ${model?.modelName || ""}`
                            : `Renting a car ${name?.carName || ""} ${model?.modelName || ""}`,
                        startDate: rest.startDate,
                        endDate: rest.endDate,
                        rentalType: carId.rentalType,
                        city: carId.city,
                        totalCost: rest.totalCost,
                        paymentStatus:order.ended==true? "ended": order.paymentStatus,
                    };
                } else {
                    return {
                        id: rest._id,
                        title: lang === "ar"
                            ? `تملك سيارة ${name?.carName || ""} ${model?.modelName || ""}`
                            : `Owning a car ${name?.carName || ""} ${model?.modelName || ""}`,
                        ownershipPeriod: carId.ownershipPeriod,
                        rentalType: carId.rentalType,
                        totalCost: rest.totalCost,
                        city: carId.city,
                        paymentStatus:order.ended==true? "ended": order.paymentStatus,
                    };
                }
            })
        );


        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en" ? "Your request has been completed successfully" : "تمت معالجة الطلب بنجاح",
            data: {
                orders: formattedOrders,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalOrders / limit),
                }
            }
        });
    } catch (err) {
        next(err);
    }
};
const getOrdersForRentalOfficeByWeekDay = async (req, res, next) => {
    try {
        const rentalOfficeId = req.user.id;
        const lang = req.headers['accept-language'] || 'en';

        // جلب عدد الطلبات الكلي
        const fullOrders = await rentalOfficeOrder.find({ rentalOfficeId });
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

        // إحصائيات الطلبات حسب أيام الأسبوع
        const result = await rentalOfficeOrder.aggregate([
            {
                $match: {
                    rentalOfficeId: new mongoose.Types.ObjectId(String(rentalOfficeId)),
                    date: {
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                        $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                    }
                }
            },
            {
                $addFields: {
                    weekday: { $dayOfWeek: "$date" } // 1 (Sunday) to 7 (Saturday)
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

        // نحول النتيجة إلى كائن للتسهيل
        const statsMap = {};
        result.forEach(r => {
            statsMap[r._id] = r.count;
        });

        // نرجع كل الأيام من 1 إلى 7، ونضع 0 لو مش موجود في aggregate
        const stats = Object.entries(days).map(([key, value]) => ({
            day: value,
            count: statsMap[key] || 0
        }));

        res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en" ? "Your request has been completed successfully" : "تمت معالجة الطلب بنجاح",
            data: {
                report: stats,
                orders: fullOrders.length,
                cars: cars.length,
                rating: rating.length,
                revenu: totalRevenue
            }
        });

    } catch (err) {
        next(err);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        if (!orderId) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.order.orderId
            })
        }
        const rawComments = await rentalOfficeOrder.findById({ _id: orderId }).populate('carId');
        let formattedOrder
        const { carId, ...rest } = rawComments.toObject();
        const name = await Name.findOne({ _id: carId.nameId });
        console.log(name)
        const model = await Model.findOne({ _id: carId.modelId });
        if (carId.rentalType == "weekly/daily") {
            formattedOrder = {
                title: lang == "ar" ? `تأجير سياره ${name.carName + " " + model.modelName}` : `Renting a car ${name.carName + " " + model.modelName}`,
                rentalType: carId.rentalType,
                images: carId.images,
                carDescription: carId.carDescription,
                carModel: carId.carModel,
                city: carId.city,
                odoMeter: carId.odoMeter,
                licensePlateNumber: carId.licensePlateNumber,
                startDate: rest.startDate,
                endDate: rest.endDate,
                pickupLocation: rest.pickupLocation,
                licenseImage: rest.licenseImage,
                priceType: rest.priceType,
                paymentStatus:rest.ended==true? "ended": rest.paymentStatus,
                price: rest.priceType == "open_km" ? carId.pricePerExtraKilometer : carId.pricePerFreeKilometer,
                video:carId.videoCar?carId.videoCar:""
            }
        }
        else if (carId.rentalType == "rent to own") {
            formattedOrder = {
                title: lang === "ar" ? `تملك سيارة ${name.carName} ${model.modelName}` : `Owning a car ${name.carName} ${model.modelName}`,
                rentalType: carId.rentalType,
                images: carId.images,
                carDescription: carId.carDescription,
                ownershipPeriod: carId.ownershipPeriod,
                carPrice: carId.carPrice,
                finalPayment: carId.finalPayment,
                carModel: carId.carModel,
                city: carId.city,
                odoMeter: carId.odoMeter,
                licensePlateNumber: carId.licensePlateNumber,
                startDate: rest.startDate,
                paymentStatus:rest.ended==true? "ended": rest.paymentStatus,
                licenseImage: rest.licenseImage,
                video:carId.videoCar?carId.videoCar:""
            }
        }
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en" ? "Your request has been completed successfully" : "تمت معالجة الطلب بنجاح",
            data: {
                ...formattedOrder

            }
        })


    }
    catch (error) {
        next(error)
    }
}
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

            const fileName = `${Date.now()}-${encodeURIComponent(file.originalname)}`;
            const saveDir = path.join(__dirname, '../images');
            const filePath = path.join(saveDir, fileName);

            if (!fs.existsSync(saveDir)) {
                fs.mkdirSync(saveDir, { recursive: true });
            }

            fs.writeFileSync(filePath, file.buffer);

            const fileUrl = `${BASE_URL}images/${fileName}`;
            const order = await rentalOfficeOrder.findByIdAndUpdate(
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
            return res.status(200).send({
                status: true,
                code: 200,
                message: messages.order.acceptedSuccess || "تم قبول الطلب ورفع فيديو السيارة بنجاح",
            });
        }
        else {
            const order = await rentalOfficeOrder.findByIdAndUpdate(
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
        const messages = getMessages(lang);
        const rentalOfficeId = req.user.id;
        const now = new Date();
        const orders = await rentalOfficeOrder.find({ rentalOfficeId, isAvailable: true }).populate('carId');
        updateOrderStatuses(orders)
        // الطلبات التي تم تسليمها
        const deliveredOrders = await rentalOfficeOrder.find({ isDelivered: true, rentalOfficeId: rentalOfficeId });

        // الطلبات قيد الانتظار
        const pendingOrders = await rentalOfficeOrder.find({ status: "pending", rentalOfficeId: rentalOfficeId });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // الطلبات التي انتهى تاريخ تأجيرها (endDate < now)
        const expiredOrders = await rentalOfficeOrder.find({
            endDate: { $lt: today }, rentalOfficeId: rentalOfficeId
        });

        return res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en" ? "Your request has been completed successfully" : "تمت معالجة الطلب بنجاح",
            data: {
                deliveredOrders: deliveredOrders.length,
                pendingOrders: pendingOrders.length,
                expiredOrders: expiredOrders.length

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
        const rentalOfficeId = req.user.id; // من التوكن
        console.log(rentalOfficeId)
        const page = parseInt(req.query.page) || 1;
        const lang = req.headers['accept-language'] || 'en';
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const messages = getMessages(req.headers['accept-language'] || 'en');

        // استعلام بعدد الطلبات
        const totalOrders = await rentalOfficeOrder.countDocuments({ rentalOfficeId, isAvailable: true });

        // جلب الطلبات ومعاها carId
        const orders = await rentalOfficeOrder.find({ rentalOfficeId, isAvailable: true })
            .populate('carId') // جلب بيانات العربية
            .skip(skip)
            .limit(limit)
            .lean();
        console.log(orders)
        if (orders.length === 0) {
            return res.status(200).send({
                status: true,
                code: 200,
                message: messages.order.existOrders || "لا توجد طلبات",
                data: {
                    orders: [],
                    pagination: {
                        currentPage: page,
                        totalPages: 0
                    }
                }
            });
        }

        // تحويل carId → carDetails
        const formattedOrders = await Promise.all(
            orders.map(async order => {
                const { carId, ...rest } = order;

                const name = await Name.findOne({ _id: carId.nameId });
                const model = await Model.findOne({ _id: carId.modelId });

                if (carId.rentalType == "weekly/daily") {
                    const diffInDays = Math.ceil(
                        (new Date(rest.endDate) - new Date(rest.startDate)) / (1000 * 60 * 60 * 24)
                    );

                    return {
                        id: rest._id,
                        title: lang === "ar"
                            ? `تأجير سيارة ${name?.carName || ""} ${model?.modelName || ""}`
                            : `Renting a car ${name?.carName || ""} ${model?.modelName || ""}`,
                        orderType: "nonOwnership",
                        image: carId.images?.[0],
                        licensePlateNumber: carId.licensePlateNumber,
                        rentalDays: diffInDays,
                        startDate: rest.startDate,
                        endDate: rest.endDate,
                        priceType: rest.priceType,
                        price:
                            rest.priceType === "open_km"
                                ? carId.freeKilometers * carId.pricePerFreeKilometer
                                : carId.pricePerExtraKilometer,
                        deliveryType: rest.deliveryType,
                        paymentMethod: rest.paymentMethod
                    };
                } else {
                    return {
                        id: rest._id,
                        title: lang === "ar"
                            ? `تملك سيارة ${name?.carName || ""} ${model?.modelName || ""}`
                            : `Owning a car ${name?.carName || ""} ${model?.modelName || ""}`,
                        orderType: "Ownership",
                        image: carId.images?.[0],
                        licensePlateNumber: carId.licensePlateNumber,
                        monthlyPayment: carId.monthlyPayment,
                        finalPayment: carId.finalPayment,
                        carName: carId.carName,
                        carType: carId.carType,
                        carModel: carId.carModel,
                        odoMeter: carId.odoMeter
                    };
                }
            })
        );


        return res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en" ? "Your request has been completed successfully" : "تمت معالجة الطلب بنجاح",
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
const isAvailable = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const rentalOfficeId = req.user.id;
        console.log(rentalOfficeId)
        const orderId = req.params.id;
        const available = req.query.available;
        console.log(available)
        if (!orderId) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang == "en" ? "orderId is required" : "رقم الطلب مطلوب"
            });

        }
        if (!available) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang == "en" ? "available is required and must be boolean" : "قيمه التوفر يجب ان true or false"
            });

        }
        await rentalOfficeOrder.findByIdAndUpdate(orderId, { isAvailable: available }, { new: true });
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === 'ar' ? 'تم التحديث بنجاح' : 'Updated successfully',
        });
    }
    catch (error) {
        next(error)
    }
}








module.exports = {
    addOrder,
    updateOrderStatuses,
    ordersForRentalOfficewithstatus,
    getOrdersForRentalOfficeByWeekDay,
    getOrderById,
    acceptorder,
    getOrders,
    getBookedDays,
    getOrdersByRentalOffice,
    isAvailable
}








