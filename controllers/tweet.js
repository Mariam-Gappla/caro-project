const Tweet = require("../models/tweets");
const { tweetValidationSchema } = require("../validation/tweetvalidition");
const Comment = require("../models/comments.js");
const getMessages=require("../configration/getmessages.js");
const Replies=require("../models/replyOnComments.js");
const path = require("path");
const fs = require("fs");
const addTweet = async (req, res, next) => {
    try {
        const lang=req.headers['accept-language'] || 'en';
        const file=req.file;
        const messages=getMessages(lang);
        const { error } = tweetValidationSchema(lang).validate(req.body);
        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message
            });
        }
        const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
        const id = req.user.id;
        const { content } = req.body;
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(__dirname, '../images', fileName);
        const imageUrl= BASE_URL+fileName;
         fs.writeFileSync(filePath, file.buffer);
        const tweets = await Tweet.create({
            content: content,
            userId: id,
            image:imageUrl || ""
        });
        res.status(200).send({
            code: 200,
            status: true,
            message: messages.tweet.addTweet,
        })
    }
    catch (err) {
        next(err)
    }
}
const addLike = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const tweetId = req.params.id;
        console.log(tweetId);
        const lang=req.headers['accept-language'] || 'en';
        const messages=getMessages(lang);
        const tweet = await Tweet.findOne({ _id: tweetId });
        if (!tweet) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.tweet.existTweet
            });
        }
        const alreadyLiked = tweet.likedBy.includes(userId);
        let updatedTweet;
        if (alreadyLiked) {
            // Remove the like
            updatedTweet = await Tweet.findByIdAndUpdate(
                tweetId,
                { $pull: { likedBy: userId } },
                { new: true }
            );
        } else {
            // Add the like
            updatedTweet = await Tweet.findByIdAndUpdate(
                tweetId,
                { $addToSet: { likedBy: userId } }, // $addToSet prevents duplicates
                { new: true }
            );
        }
        return res.status(200).json({
            status: true,
            code: 200,
            message: alreadyLiked ? messages.tweet.removeLike : messages.tweet.addLike,
            likesCount: updatedTweet.likedBy.length
        });
    }
    catch (err) {
        next(err);
    }
}
const getTweetWithCommentsAndReplies = async (req, res, next) => {
  try {
    const tweetId = req.params.id;
    const lang = req.headers['accept-language'] || 'en';
    const messages = getMessages(lang);

    // Step 1: جيب التويتة
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: messages.tweet.existTweet
      });
    }

    // Step 2: جيب التعليقات المرتبطة بالتويتة
    const comments = await Comment.find({ tweetId }).populate('userId', 'username image');

    // Step 3: لف على كل comment وجيب الردود من جدول Reply
    const commentsWithReplies = await Promise.all(
      comments.map(async comment => {
        const commentObj = comment.toObject();
        commentObj.userData = commentObj.userId;
        delete commentObj.userId;

        // جيب الردود المرتبطة بالتعليق ده
        const replies = await Reply.find({ commentId: comment._id }).populate('userId', 'username image');

        // نظّم الردود
        commentObj.replies = replies.map(reply => {
          const replyObj = reply.toObject();
          replyObj.userData = replyObj.userId;
          delete replyObj.userId;
          return replyObj;
        });

        return commentObj;
      })
    );

    // Step 4: رجّع الرد النهائي
    res.status(200).send({
      code: 200,
      status: true,
      tweet,
      comments: commentsWithReplies
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
    addTweet,
    addLike,
    getTweetWithCommentsAndReplies
}