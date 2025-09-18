const mongoose = require("mongoose");
const carPlateSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true },     
  plateLetters: { type: String, required: true },     
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true }, 
  notes: { type: String },                           
  ownershipFeesIncluded: { type: Boolean, default: false },
  isFixedPrice:{type:Boolean,default:false},
  auctionStart: { type: Date },    
  auctionEnd: { type: Date},
  postNumber:{type:Number},
  price:{type:Number,required:true},
  priceAfterAuction:{type:Number},
  phoneNumber: { type: String, required: true  }, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true  }
}, { timestamps: true });

const carPlate = mongoose.model("CarPlate", carPlateSchema);
module.exports = carPlate;