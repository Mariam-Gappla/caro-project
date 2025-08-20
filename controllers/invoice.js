const counter = require("../models/counter");
const invoice = require("../models/invoice");
const Name = require("../models/carName");
const carArchive=require("../models/carArchive")
const carRental = require("../models/carRental")
const Model = require("../models/carModel");
const rentalOfficeOrder = require("../models/rentalOfficeOrders");
const rentalOffice = require("../models/rentalOffice");
const getMessages = require("../configration/getmessages");
const { invoiceSchema } = require("../validation/invoice")
const addinvoice = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const messages = getMessages(lang);

        const { error } = invoiceSchema(lang).validate(req.body);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }
        console.log(messages.invoice.invalidRentalType)
        const { userId, rentalOfficeId, orderId } = req.body;
        const order = await rentalOfficeOrder.findOne({ _id: orderId })
        const existingInvoice = await invoice.findOne({
            userId,
            rentalOfficeId,
            orderId
        });

        if (existingInvoice) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: messages.invoice.existInvoice
            });
        }

        const orderExist = await rentalOfficeOrder.findOne({
            _id: orderId,
            userId: userId,
            rentalOfficeId: rentalOfficeId
        });

        if (!orderExist) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: messages.invoice.invalidOrderForUserOrOffice
            });
        }

        // ✅ جلب بيانات السيارة
        const car = await carRental.findById(orderExist.carId) || carArchive.findOne({originalCarId:order.carId});
        if (!car) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: messages.invoice.carNotFound || "Car not found",
            });
        }


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
            userId,
            rentalOfficeId,
            orderId,
            amount: order.totalCost,
        });

        res.status(200).send({
            code: 200,
            status: true,
            message: messages.invoice.success,
        });
    } catch (err) {
        next(err);
    }
};
const getRevenue = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const messages = getMessages(lang);
        const rentalOfficeId = req.user.id;

        const rentalOfficeExist = await rentalOffice.findById(rentalOfficeId);
        if (!rentalOfficeExist) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: messages.invoice.rentalOfficeId
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalCount = await invoice.countDocuments({ rentalOfficeId });

        const invoices = await invoice.find({ rentalOfficeId })
            .skip(skip)
            .limit(limit)
            .sort({ issuedAt: -1 }); // اختياري حسب الترتيب

        const formattedInvoices = invoices.map((inv) => ({
            _id: inv._id,
            invoiceNumber: inv.invoiceNumber,
            amount: inv.amount,
            issuedAt: inv.issuedAt
        }));

        res.status(200).send({
            code: 200,
            status: true,
            message: lang === "en" ? "Invoices fetched successfully" : "تم جلب الفواتير بنجاح",
            data: {
                revenue: formattedInvoices,
                pagination: {
                    page,
                    totalPages: Math.ceil(totalCount / limit),
                }
            }
        });

    } catch (err) {
        next(err);
    }
};
const getRevenueById = async (req, res, next) => {
    try {
        const revenuId = req.params.id;
        const lang = req.headers["accept-language"] || "en";
        const messages = getMessages(lang);

        if (!revenuId) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.invoice.invoiceId || (lang === "ar" ? "معرف الفاتورة مطلوب" : "Invoice ID is required")
            });
        }

        // جلب الفاتورة مع بيانات الطلب
        let revenuDetails = await invoice.findById(revenuId).populate('orderId').lean();

        if (!revenuDetails) {
            return res.status(404).send({
                status: false,
                code: 404,
                message: lang === "ar" ? "الفاتورة غير موجودة" : "Invoice not found"
            });
        }

        const orderData = revenuDetails.orderId;

        if (!orderData) {
            return res.status(404).send({
                status: false,
                code: 404,
                message: lang === "ar" ? "الطلب المرتبط غير موجود" : "Associated order not found"
            });
        }

        let carData = null;

        // نحاول نجيب العربية من carId
        if (orderData.carId) {
            carData = await carRental.findById(orderData.carId).lean();
        }
        // لو مش موجودة في جدول العربيات الأساسي، نجرب من الأرشيف باستخدام carOriginalId لو موجود
        if (!carData && orderData.archivedCarId) {
            carData = await carArchive.findOne({_id: orderData.archivedCarId}).lean();
            console.log(orderData)
        }

        if (!carData) {
            return res.status(404).send({
                status: false,
                code: 404,
                message: lang === "ar" ? "بيانات السيارة غير موجودة" : "Car data not found"
            });
        }

        // جلب الاسم والموديل
        const [name, model] = await Promise.all([
            Name.findById(carData.nameId),
            Model.findById(carData.modelId)
        ]);

        // تجهيز الرسالة النصية لحالة الدفع
        const paymentStatusTranslations = {
            en: { ended: "Ended", inProgress: "In Progress", paid: "Paid" },
            ar: { ended: "منتهي", inProgress: "قيد الانتظار", paid: "مدفوع" }
        };
        const paymentStatus = orderData.ended ? "ended" : orderData.paymentStatus;
        const paymentStatusText = paymentStatusTranslations[lang][paymentStatus] || "";

        // تجهيز بيانات الفاتورة حسب نوع الإيجار
        let formattedInvoice;
        if (carData.rentalType === "weekly/daily") {
            formattedInvoice = {
                rentalType: carData.rentalType,
                images: carData.images || [],
                title: lang === "ar"
                    ? `تأجير سيارة ${(name?.carName?.ar || "")} ${(model?.model?.ar || "")}`
                    : `Renting a car ${(name?.carName?.en || "")} ${(model?.model?.en || "")}`,
                carDescription: carData.carDescription || "",
                model: lang === "ar" ? model?.model?.ar : model?.model?.en,
                odoMeter: carData.odoMeter || "",
                licensePlateNumber: carData.licensePlateNumber || "",
                city: carData.city || "",
                area: carData.area || "",
                revenuNumber: revenuDetails.invoiceNumber,
                startDate: orderData.startDate,
                endDate: orderData.endDate,
                paymentStatus,
                paymentStatusText,
                deliveryOption: carData.deliveryOption,
                totalCost: orderData.totalCost,
                price: carData.priceType === "open_km" ? carData.pricePerFreeKilometer : carData.pricePerExtraKilometer,
            };
        } else {
            formattedInvoice = {
                rentalType: carData.rentalType,
                images: carData.images || [],
                title: lang === "ar"
                    ? `تملك سيارة ${(name?.carName?.ar || "")} ${(model?.model?.ar || "")}`
                    : `Owning a car ${(name?.carName?.en || "")} ${(model?.model?.en || "")}`,
                carDescription: carData.carDescription || "",
                model: lang === "ar" ? model?.model?.ar : model?.model?.en,
                odoMeter: carData.odoMeter || "",
                city: carData.city || "",
                paymentStatus,
                paymentStatusText,
                totalCost: orderData.totalCost,
                monthlyPayment: carData.monthlyPayment || 0,
                price: carData.carPrice || 0,
                finalPayment: carData.finalPayment || 0,
                licensePlateNumber: carData.licensePlateNumber || "",
                area: carData.area || "",
                revenuNumber: revenuDetails.invoiceNumber,
                deliveryOption: carData.deliveryOption,
                startDate: orderData.startDate,
            };
        }

        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en" ? "Invoice fetched successfully" : "تم جلب الفاتورة بنجاح",
            data: formattedInvoice
        });

    } catch (error) {
        next(error);
    }
};




module.exports = {
    addinvoice,
    getRevenue,
    getRevenueById
}