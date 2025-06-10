const mongoose = require('mongoose');
const carRentalSchema = new mongoose.Schema({
  rentalType: { type: String, required: true,enum:["يومى","اسبوعى","اسبوعي","يومي","منتهى بتملك","منتهي بتملك"]},           
  images: [{ type: String }],                              
  carName: { type: String, required: true },              
  carType: { type: String, required: true },              
  carModel: { type: Number, required: true },              
  licensePlateNumber: { type: String, required: true },   
  freeKilometers: { type: Number, required: true },        
  pricePerFreeKilometer: { type: Number, required: true }, 
  pricePerExtraKilometer: { type: Number, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  deliveryOption: { type: Boolean, default: false },      
  carDescription: { type: String },
  pickupDate: { type: Date },
  returnDate: { type: Date},
  licenseImage: { type: String },                         
  paymentMethod: { type: String },        
  pickupType: { type: String },            
  totalPrice: { type: Number},
  deliveryLocation: { type: String },
  rentalOfficeId  :{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RentalOffice', 
    required: true 
  }                      
});
const CarRental = mongoose.model('CarRental', carRentalSchema);
module.exports=CarRental;
