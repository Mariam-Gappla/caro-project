const Tweet = require("../models/tweets");
const { tweetValidationSchema } = require("../validation/tweetvalidition");
const Comment = require("../models/comments.js");
const getMessages=require("../configration/getmessages.js");
const addTweet = async (req, res, next) => {
    try {
        const lang=req.headers['accept-language'] || 'en';
        const messages=getMessages(lang);
        const { error } = tweetValidationSchema(lang).validate(req.body);
        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message
            });
        }
        const id = req.user.id;
        const { content } = req.body;
        const tweets = await Tweet.create({
            content: content,
            userId: id,
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
const getTweetWithComments = async (req, res, next) => {
    try {
        const tweetId = req.params.id;
         const lang=req.headers['accept-language'] || 'en';
        const messages=getMessages(lang);
        //get tweet
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.tweet.existTweet
            });
        }
        const rawComments = await Comment.find({ tweetId }).populate('userId', 'name email');

        const comments = rawComments.map(comment => {
            const commentObj = comment.toObject();
            commentObj.userData = commentObj.userId;
            delete commentObj.userId;
            return commentObj;
        });
        res.status(200).send({
            code: 200,
            status: true,
            tweet,
            comments
        });

    } catch (err) {
        next(err);
    }
};
module.exports = {
    addTweet,
    addLike,
    getTweetWithComments
}