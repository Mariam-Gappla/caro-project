const { string } = require('joi');
const mongoose = require('mongoose');
const rentalOfficeOrderSchema = new mongoose.Schema({
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
  carId:{
       type: mongoose.Schema.Types.ObjectId, 
    ref: 'CarRental', 
    required: true
  },
  paymentStatus:{
   type: String,
    enum:["بانتظار الدفع","تم الدفع"],
    default:"بانتظار الدفع",
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
});
const rentalOfficeOrders = mongoose.model('OrdersRentalOffice', rentalOfficeOrderSchema);
module.exports=rentalOfficeOrders;