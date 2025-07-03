const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rentalOfficeId: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalOffice' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'OrdersRentalOffice' },
  type: { type: String, enum: ['newOrder', 'statusChanged', 'review', 'ended'], required: true },
  title: { type: String, required: true },   // 👈 العنوان
  message: { type: String, required: true }, // 👈 التفاصيل
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Notification', notificationSchema);
