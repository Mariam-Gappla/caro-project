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
    enum: ['OrdersRentalOffice', 'ServiceProviderOrders','AuctionOrder'],
  },
  type:{
    type:String,
    enum: ['showroom','auction'],
  },
  action:{
    type:Boolean,
    default:false,
  },
  actionType: {
    type: String,
    enum: ['message', 'follow', 'order', 'system','wallet','provider','actionOrder'],
    default: 'system',
  },
  title: { en: { type: String, required: true }, ar: { type: String, required: true } },
  message: { en: { type: String, required: true }, ar: { type: String, required: true } },
  request:{type:Boolean,default:false},
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Notification', notificationSchema);
