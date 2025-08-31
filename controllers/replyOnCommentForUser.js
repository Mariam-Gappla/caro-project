const {ReplyOnCommentForUser}=require("../models/replyOnCommentForUser");
const { replyOnCommentForUserValiditionSchema } = require("../validation/replyOnCommentValidition");
const addReplyForUser = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const lang = req.headers['accept-language'] || 'en';
        console.log("🚀 tweetId from body:", req.body.tweetId);
        console.log("✅ isValid:", mongoose.Types.ObjectId.isValid(req.body.tweetId));

        const messages = getMessages(lang);
        const { error } = replyOnCommentForUserValiditionSchema(lang).validate({
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
        const reply = await ReplyOnCommentForUser.create({
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
const getRepliesOnCommentForUser = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const messages = getMessages(lang);
    const { commentId, postId } = req.params;

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

    const replies = await ReplyOnCommentForUser
      .find({ commentId, postId })
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
    addReplyForUser,
    getRepliesOnCommentForUser
}