const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType' // هياخد الاسم من targetType
  },
  targetType: {
    type: String,
    enum: ['User', 'serviceProvider', 'rentalOffice'], // أسماء الموديلات الحقيقية
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'orderModel'
  },
  orderModel: {
    type: String,
    enum: ['OrdersRentalOffice', 'ServiceProviderOrders'],
    required: function () {
      return this.orderId != null;
    }
  },
  actionType: {
    type: String,
    enum: ['message', 'follow', 'order', 'system','wallet','provider'],
    default: 'system',
  },
  title: { en: { type: String, required: true }, ar: { type: String, required: true } },
  message: { en: { type: String, required: true }, ar: { type: String, required: true } },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Notification', notificationSchema);
