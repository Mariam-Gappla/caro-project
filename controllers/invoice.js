const counter = require("../models/counter");
const invoice = require("../models/invoice");
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
            
        const { userId, rentalOfficeId, orderId } = req.body;
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
        const count = await counter.findOneAndUpdate(
            { _id: "invoice" },
            { $inc: { seq: 1 } },
            { returnDocument: "after", upsert: true }
        );
        if (!counter) {
            return res.status(500).json({ message: "Counter not found" });
        }

        await invoice.create({
            invoiceNumber: count.seq,
            userId: req.body.userId,
            rentalOfficeId: req.body.rentalOfficeId,
            orderId: req.body.orderId, 
            amount: req.body.amount,
        });
        res.status(200).send({
            code: 200,
            status: true,
            message: messages.invoice.success,

        })

    }
    catch (err) {
        next(err);
    }


}
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
    const revenuDetails = await invoice.find({ _id: revenuId })
      .populate({
        path: "orderId",
        populate: {
          path: "carId" // 👈 دي اللي انتي عايزاها
        }
      });

    return res.send({ revenuDetails });
  } catch (error) {
    next(error);
  }
};

module.exports = {
    addinvoice,
    getRevenue,
    getRevenueById
}