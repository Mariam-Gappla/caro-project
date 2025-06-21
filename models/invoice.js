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
  rentalOfficeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RentalOffice',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrdersRentalOffice',
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
