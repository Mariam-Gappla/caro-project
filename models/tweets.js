const mongoose = require('mongoose');
const tweetSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 280
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
  image:{
    type:String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const Tweet = mongoose.model('Tweet', tweetSchema);
module.exports=Tweet;
