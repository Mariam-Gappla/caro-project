// models/Invoice.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: Number,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetType',
  },
  targetType: {
    type: String,
    enum: ['rentalOffice', "User"]
  },
  amount: {
    type: Number,
    required: true
  },
  orderType: {
    type: String,
    required: true,
    enum: ['OrdersRentalOffice',"CarPlate",'Wallet','Car']
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'orderType',
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
