const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
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
  resetOtpExpires: {
    type: Date
  },
  fcmToken: {
    type: String
  }

}, { timestamps: true });
const Admin= mongoose.model("Admin", adminSchema);
module.exports = Admin;