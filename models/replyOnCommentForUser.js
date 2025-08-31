const mongoose = require('mongoose');
const replyOnCommentForUserSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});
const replyOnComment = mongoose.model('ReplyOnCommentForUser', replyOnCommentForUserSchema);
module.exports = replyOnComment;