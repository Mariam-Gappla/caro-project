// controllers/auctionController.js
const AuctionOrder = require("../models/auctionOrder");
const Wallet = require("../models/wallet");
const Invoice = require("../models/invoice");
 // ← نجيب io اللي عملناه في index.js

const getNextOrderNumber = require("../controllers/counter");
const placeBid = async (io, req, res) => {
    try {
        const io = req.app.get("io");
        const lang = req.headers["accept-language"] || "en";
        const { userId, amount, targetType, targetId } = req.body;
        const auction = await AuctionOrder.findOne({ targetId, targetType });
        if (!auction) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === "ar" ? "االعنصر غير موجود" : "item not found"
            });
        }
        const wallet = await Wallet.findOne({ userId });
        if (!wallet || wallet.balance < amount) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === "ar" ? "الرصيد غير كافٍ للمزايدة" : "Insufficient balance to place bid"
            });
        }
        // التأكد إن المزايدة أعلى من السعر الحالي
        if (amount <= auction.price) {
            auction.price = amount;
            auction.userId = userId;
        }
        await auction.save();
        wallet.balance -= amount;
        await wallet.save();
        const counter = await getNextOrderNumber("invoice");
        await Invoice.create({
            invoiceNumber: counter,
            userId: userId,
            targetType: "User",
            targetId: targetId,
            orderType: "OrdersRentalOffice",
            orderId: order._id,
            amount: amount,
        });

        /*
         io.emit("auctionUpdate", {
             auctionId: targetId,
             amount,
             userId,
         });
 */
        res.status(200).send({
            status: true,
            code: 200,
            message: lang === "ar" ? "تم تقديم المزايدة بنجاح" : "Bid placed successfully",
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { placeBid };
