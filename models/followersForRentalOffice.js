const mongoose = require('mongoose');
const followerSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rentalOfficeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'rentalOffice', 
    required: true 
  },
  followedAt: { 
    type: Date, 
    default: Date.now 
  }
});
followerSchema.index({ userId: 1, rentalOfficeId: 1 }, { unique: true });

const follower = mongoose.model('Follower', followerSchema);
module.exports=follower;
