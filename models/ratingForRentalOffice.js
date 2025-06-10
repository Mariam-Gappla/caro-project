
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rentalOfficeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RentalOffice', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});
ratingSchema.index({ userId: 1, rentalOfficeId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
