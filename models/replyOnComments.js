const mongoose = require('mongoose');
const replyOnCommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tweetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet',
    required: true
  },
  commentId:{
       type: mongoose.Schema.Types.ObjectId, 
    ref: 'Comment', 
    required: true
  },
  content:{
    type:String,
    required:true
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
});
const replyOnComment = mongoose.model('ReplyOnComment', replyOnCommentSchema);
module.exports=replyOnComment;