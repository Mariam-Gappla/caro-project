const { required } = require('joi');
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
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarRental',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
  },
  licenseImage: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum:["cash","online"]
  },
  pickupLocation: {
    lat: {
      type: Number,
    },
    long: {
      type: Number,
    }
  },
  ended:{
     type: Boolean,
    default: false 
  },
  deliveryType: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["inProgress", "paid"],
    default: "inProgress",
  },
  status:{
    type:String,
    enum: ["pending", "accepted","refused"],
    default:"pending"
  },
  isDelivered: {
    type: Boolean,
    default: false 
  },
  totalCost:{
    type:Number,
    required:true,
  },
  priceType:{type:String ,enum:["open_km","limited_km"]},
  archivedCarId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'CarRentalArchive'
},
  date: {
    type: Date,
    default: Date.now
  }
});
const rentalOfficeOrders = mongoose.model('OrdersRentalOffice', rentalOfficeOrderSchema);
module.exports = rentalOfficeOrders;