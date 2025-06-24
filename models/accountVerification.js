const mongoose = require('mongoose');

const accountVerificationSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'serviceProvider', // الربط بالمستخدم
    required: true
  },
  serviceType:{
     type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  nationality: {
    type: String,
    required: true
  },
  nationalId: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  iban: {
    type: String,
    required: true
  },
  bankAccountName: {
    type: String,
    required: true
  },
  winchType: {
    type: String,
    required: true
  },
  carPlateNumber: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    required: true
  },
  nationalIdImage: {
    type: String,
    required: true
  },
  licenseImage: {
    type: String,
    required: true
  },
  carRegistrationImage: {
    type: String,
    required: true
  },
  carImage: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'refused'],
    default: 'pending'
  },
  notes:{
    type:String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('WinchVerification', accountVerificationSchema);

