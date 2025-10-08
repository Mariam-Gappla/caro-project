
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: `${process.env.BASE_URL}images/rentalOffice.PNG`,
  },
  resetOtp: {
    type: Number
  },
  status: {
    type: String,
    enum: ["verified", "unverified", "premium"],
    default: "unverified"
  },
  resetOtpExpires: {
    type: Date
  },
  cityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City"
  },
  whatsAppNumber: {
    type: String
  },
  details: {
    type: String
  },
  categoryCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MainCategoryCenter"
  },
  subCategoryCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategoryCenter"
  },
  tradeRegisterNumber: {
    type: String
  },
  nationalId: {
    type: String,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'], // لازم "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
  service:{
   type:mongoose.Schema.Types.ObjectId,
   ref:"SlavgeService"
  },
  brand: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "CarName"
}],
  cityId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "City"
  },
  role: {
    type: String,
  },
  isProvider: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });
const User = mongoose.model("User", userSchema);
userSchema.index({ location: "2dsphere" });
module.exports = User;