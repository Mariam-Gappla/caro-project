const mongoose= require("mongoose");
const transactionSchema = new mongoose.Schema({
  transactionId: { type: Number, unique: true }, // رقم متسلسل
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true },
  type: {
    type: String,
    enum: ["deposit", "withdraw"],
    required: true
  },
  amount: { type: Number, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports=mongoose.model("Transaction", transactionSchema);