const mongoose = require('mongoose');

const tireVerificationSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'serviceProvider', // الربط بالمستخدم
    required: true
  },
  serviceType:{
    type: String,
    enum: ['tire Filling', 'battery Jumpstart', 'tire Filling and battery Jumpstart'],
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
  profileImage: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'refused'],
    default: 'pending'
  },
  notes:{
    type:String,
    required:false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('TireVerification', tireVerificationSchema);

