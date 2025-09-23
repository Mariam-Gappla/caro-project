const mongoose = require("mongoose");
const carPlateSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true },
  plateLetters: {
    en: {
      type: String,
      required: true
    },
    ar: {
      type: String,
      required: true
    }
  },
  digites:{
    type:"Number",
    required:true,
    enum:[1,2,3,4]
  },
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
  notes: { type: String },
  ownershipFeesIncluded: { type: Boolean, default: false },
  isFixedPrice: { type: Boolean, default: false },
  auctionStart: { type: Date },
  auctionEnd: { type: Date },
  postNumber: { type: Number },
  price: { type: Number, required: true },
  priceAfterAuction: { type: Number },
  phoneNumber: { type: String, required: true },
  plateType: {
    type: String,
    enum: ["private", "commercial"],
    required: true
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

const carPlate = mongoose.model("CarPlate", carPlateSchema);
module.exports = carPlate;