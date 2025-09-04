const mongoose = require('mongoose');

const ratingCenterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
   centerId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
   },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('RatingCenter', ratingCenterSchema);
