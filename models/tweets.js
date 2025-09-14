const mongoose = require('mongoose');
const tweetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  images: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const Tweet = mongoose.model('Tweet', tweetSchema);
module.exports = Tweet;
