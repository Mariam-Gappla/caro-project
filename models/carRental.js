const mongoose = require('mongoose');
const carRentalSchema = new mongoose.Schema({
  nameId: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
  modelId: { type: mongoose.Schema.Types.ObjectId, ref: "Model", required: true },
  title:{type: String, required: true},
  rentalType: { type: String, required: true,enum:["weekly/daily","rent to own"]},           
  images: [{ type: String }],                               
  carType: { type: String, required: true },                            
  licensePlateNumber: { type: String, required: true },   
  freeKilometers: { type: Number}, 
  odoMeter:{type:Number},  
  ownershipPeriod:{type:String},
  pricePerFreeKilometer: { type: Number}, 
  pricePerExtraKilometer: { type: Number},
  city: { type: String, required: true },
  area: { type: String, required: true },
  deliveryOption: { type: Boolean, default: false },      
  carDescription: { type: String },
  totalKilometers:{type: String},
  carPrice:{type:Number},
  monthlyPayment:{type:Number},
  finalPayment:{type:Number},
  videoCar:{type:String},                           
  rentalOfficeId  :{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RentalOffice', 
    required: true 
  }                      
});
const CarRental = mongoose.model('CarRental', carRentalSchema);
module.exports=CarRental;
