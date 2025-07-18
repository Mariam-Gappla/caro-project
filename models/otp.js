// models/OtpCode.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
   expiresAt: { type: Date, required: true, index: { expires: 0 } }
});

const Otp = mongoose.model('OtpCode', otpSchema);
module.exports=Otp;
