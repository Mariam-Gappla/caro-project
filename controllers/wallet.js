const Wallet = require("../models/wallet.js");
const Transaction = require("../models/transaction.js");
const getNextOrderNumber = require("../controllers/counter.js");
const {sendNotification}=require("../configration/firebase.js");
const User = require("../models/user.js");
/*
const createOrder = async (req, res, next) => {
  try {
    const { userId, amount } = req.body;

    // ✅ 1- Auth مع Paymob
    const authRes = await axios.post("https://accept.paymob.com/api/auth/tokens", {
      api_key: process.env.PAYMOB_API_KEY,
    });
    const token = authRes.data.token;

    // ✅ 2- عمل Order
    const orderRes = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
      auth_token: token,
      delivery_needed: "false",
      amount_cents: amount * 100,
      currency: "EGP",
      merchant_order_id: `ORD-${userId}-${Date.now()}`
    });
    const orderId = orderRes.data.id;

    // ✅ 3- Payment Key
    const paymentRes = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", {
      auth_token: token,
      amount_cents: amount * 100,
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        apartment: "NA",
        email: "test@test.com",
        floor: "NA",
        first_name: "User",
        last_name: "Name",
        street: "NA",
        building: "NA",
        phone_number: "+201000000000",
        city: "Cairo",
        country: "EG",
        state: "NA",
      },
      currency: "EGP",
      integration_id: process.env.PAYMOB_INTEGRATION_ID,
    });

    return res.status(200).json({
      status: true,
      message: "Payment link generated",
      iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentRes.data.token}`
    });
  } catch (err) {
    next(err);
  }
};
*/
const deposit = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const userId = req.user.id;
    const { amount, description, date, cvv, name, numberId } = req.body;
    const user = User.findById(userId);
    if (amount <= 0) {
      return res.status(400).send({
        code: 400,
        status: false,
        message: lang === "en"
          ? "Amount must be greater than 0"
          : "المبلغ يجب أن يكون أكبر من 0"
      });

    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0 });
    }

    // زود الرصيد
    wallet.balance += amount;
    await wallet.save();

    // أنشئ transaction جديدة
    await Transaction.create({
      walletId: wallet._id,
      transactionId: await getNextOrderNumber("wallet"),
      type: "deposit",
      amount,
      description,
    });
    await sendNotification({
      target: user,
      targetType: "User",
      titleAr: "شحن المحفظة",
      titleEn: "Wallet Deposit",
      messageAr: `تم شحن محفظتك بمبلغ ${amount} بنجاح`,
      messageEn: `Your wallet has been successfully deposited with amount ${amount}`,
      actionType: "wallet",
    });
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en"
        ? "Deposit successful"
        : "تم الشحن بنجاح",
      data: {
        referenceNumber: "TXN-20250925-12345",
        balance: wallet.balance
      }
    });

  } catch (error) {
    next(error);
  }
};
const getBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const lang = req.headers['accept-language'] || 'en';
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: "Wallet not found"
      });
    }
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en"
        ? "Balance retrieved successfully"
        : "تم استرجاع الرصيد بنجاح",
      data: wallet.balance
    });
  } catch (error) {
    next(error);
  }
};
const getTransactions = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(400).send({
        status: false,
        code: 400,
        message:
          lang === "en" ? "Wallet not found" : "المحفظة غير موجودة",
      });
    }

    const total = await Transaction.countDocuments({ walletId: wallet._id });
    const totalPages = Math.ceil(total / limit);

    const transactions = await Transaction.find({ walletId: wallet._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const formatedTransactions = transactions.map((tran) => {
      return {
        transactionNumber: tran.transactionId,
        amount: tran.amount,
        description: tran.description,
        createdAt: tran.createdAt
      }
    })

    return res.status(200).send({
      status: true,
      code: 200,
      message:
        lang === "en"
          ? "Transactions retrieved successfully"
          : "تم استرجاع المعاملات بنجاح",
      data: {
        transactions: formatedTransactions,
        pagination: {
          page: Number(page),
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
const withdraw = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { amount, description } = req.body;
    const user = User.findById(userId);
    if (amount <= 0) {
      return res.status(400).json({ status: false, message: "Amount must be greater than 0" });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ status: false, message: "Insufficient balance" });
    }

    // خصم الرصيد
    wallet.balance -= amount;
    await wallet.save();

    // أنشئ transaction جديدة
    const transaction = await Transaction.create({
      walletId: wallet._id,
      transactionNumber: await getNextTransactionNumber(),
      type: "withdraw",
      amount,
      description,
    });
    await sendNotification({
      target: user,
      targetType: "User",
      titleAr: "خصم من المحفظة",
      titleEn: "Wallet Withdrawal",
      messageAr: `تم خصم مبلغ ${amount} من محفظتك بنجاح`,
      messageEn: `An amount of ${amount} has been successfully deducted from your wallet`,
      actionType: "wallet",
    });
    return res.status(200).json({
      status: true,
      message: "Withdraw successful",
      balance: wallet.balance,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  withdraw,
  deposit,
  getBalance
}
