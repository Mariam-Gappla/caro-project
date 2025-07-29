const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  senderType: {
    type: String,
    enum: ['user', 'serviceProvider', 'rentalOffice'],
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderType',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  }
});

const contactus = mongoose.model('ContactUs', contactMessageSchema);
module.exports = contactus;