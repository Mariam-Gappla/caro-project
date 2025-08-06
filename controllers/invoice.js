const counter = require("../models/counter");
const invoice = require("../models/invoice");
const Name = require("../models/carName");
const carRental=require("../models/carRental")
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
        const order=await rentalOfficeOrder.findOne({_id:orderId})
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
        const car = await carRental.findById(orderExist.carId);
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

        if (!invoices || invoices.length === 0) {
            return res.status(404).send({
                code: 404,
                status: false,
                message: messages.invoice.noInvoices
            });
        }

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
                    currentPage: page,
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
        const revenuDetails = await invoice.findOne({ _id: revenuId })
            .populate({
                path: "orderId",
                populate: {
                    path: "carId" // 👈 دي اللي انتي عايزاها
                }
            });
        const name = await Name.findOne({ _id:  revenuDetails.orderId.carId.nameId });
        const model = await Model.findOne({ carNameId:  revenuDetails.orderId.carId.nameId });
        let formatedInvoice;
        if (revenuDetails.orderId.carId.rentalType == "weekly/daily") {
            formatedInvoice = {
                rentalType: revenuDetails.orderId.carId.rentalType,
                image: revenuDetails.orderId.carId.images[0],
                title: lang == "ar" ? `تأجير سياره ${name.carName + " " + model.name}` : `Renting a car ${name.carName + " " + model.name}`,
                carDescription: revenuDetails.orderId.carId.carDescription,
                model: model.name,
                odoMeter: revenuDetails.orderId.carId.odoMeter,
                licensePlateNumber: revenuDetails.orderId.carId.licensePlateNumber,
                city: revenuDetails.orderId.carId.city,
                area: revenuDetails.orderId.carId.area,
                revenuNumber: revenuDetails.invoiceNumber,
                startDate: revenuDetails.orderId.startDate,
                endDate: revenuDetails.orderId.endDate,
                paymentStatus: revenuDetails.orderId.paymentStatus,
                deliveryOption: revenuDetails.carId.deliveryOption,
                totalCost: revenuDetails.orderId.totalCost,
                price: revenuDetails.carId.priceType == "open_km" ? revenuDetails.carId.pricePerFreeKilometer : revenuDetails.carId.pricePerExtraKilometer,

            }

        }
        else {
            formatedInvoice = {
                rentalType: revenuDetails.orderId.carId.rentalType,
                image: revenuDetails.orderId.carId.images[0],
                title: lang === "ar" ? `تملك سيارة ${name.carName} ${model.name}` : `Owning a car ${name.carName} ${model.name}`,
                carDescription: revenuDetails.orderId.carId.carDescription,
                model: model.name,
                odoMeter: revenuDetails.orderId.carId.odoMeter,
                city: revenuDetails.orderId.carId.city,
                paymentStatus: revenuDetails.orderId.paymentStatus,
                totalCost: revenuDetails.orderId.totalCost,
                monthlyPayment: revenuDetails.orderId.monthlyPayment,
                price: revenuDetails.orderId.carId.carPrice,
                finalPayment: revenuDetails.orderId.carId.finalPayment,
                licensePlateNumber: revenuDetails.orderId.carId.licensePlateNumber,
                city: revenuDetails.orderId.carId.city,
                area: revenuDetails.orderId.carId.area,
                revenuNumber: revenuDetails.invoiceNumber,
                deliveryOption: revenuDetails.orderId.carId.deliveryOption,
                startDate: revenuDetails.orderId.startDate



            }

        }
        return res.send({
            status: true,
            code: 200,
            message: lang === "en" ? "Invoice fetched successfully" : "تم جلب الفاتوره بنجاح",
            data: formatedInvoice
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