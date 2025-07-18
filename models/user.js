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
    type: "string",
    default: `${process.env.BASE_URL}images/rentalOffice.png`,
  },
  resetOtp: {
    type: Number
  },
  resetOtpExpires: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const User = mongoose.model("User", userSchema);
module.exports = User;