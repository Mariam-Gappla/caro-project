const mongoose = require('mongoose');
const providerRatingSchema = new mongoose.Schema({
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  userId: {
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
    type: String,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProviderOrders'
  }
}, { timestamps: true });

module.exports = mongoose.model('ProviderRating', providerRatingSchema);
