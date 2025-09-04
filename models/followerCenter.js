const mongoose = require('mongoose');
const followerCenterSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  centerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  followedAt: { 
    type: Date, 
    default: Date.now 
  }
});
followerSchema.index({ userId: 1, centerId: 1 }, { unique: true });

const followerCenter = mongoose.model('FollowerCenter', followerCenterSchema);
module.exports=followerCenter;
