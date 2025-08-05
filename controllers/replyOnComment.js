const { replyOnCommentValiditionSchema } = require("../validation/replyOnCommentValidition");
const Comment = require("../models/comments");
const replyOnComment = require("../models/replyOnComments");
const mongoose=require('mongoose');
const getMessages = require("../configration/getmessages");
const addReply = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const lang = req.headers['accept-language'] || 'en';
        console.log("🚀 tweetId from body:", req.body.tweetId);
        console.log("✅ isValid:", mongoose.Types.ObjectId.isValid(req.body.tweetId));

        const messages = getMessages(lang);
        const { error } = replyOnCommentValiditionSchema(lang).validate({
            ...req.body,
            userId: userId
        });
        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message
            });
        }
        const reply = await replyOnComment.create({
            ...req.body,
            userId: userId
        });
        res.status(200).send({
            code: 200,
            status: true,
            message: messages.replyOnComment.addReplay,
        })

    }
    catch (err) {
        next(err)
    }
}
const getRepliesOnComment = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const messages = getMessages(lang);
    const { commentId, tweetId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(commentId) ||
      !mongoose.Types.ObjectId.isValid(tweetId)
    ) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: messages.invalid.commentIdAndTweetId
      });
    }

    const replies = await replyOnComment
      .find({ commentId, tweetId })
      .populate("userId", "username email image")
      .sort({ date: -1 })
      .lean();

    const repliesWithUserData = replies.map(reply => {
      const { userId, ...rest } = reply;
      return {
        ...rest,
        userData: userId,
      };
    });

    return res.status(200).send({
      code: 200,
      status: true,
      message: messages.replyOnComment.getreplies,
      data: repliesWithUserData
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
    addReply,
    getRepliesOnComment
}