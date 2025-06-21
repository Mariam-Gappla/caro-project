const { replyOnCommentValiditionSchema } = require("../validation/replyOnCommentValidition");
const replyOnComment = require("../models/replyOnComments");
const getMessages=require("../configration/getmessages");
const addReply = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const lang=req.headers['accept-language'] || 'en';
        const messages=getMessages(lang);
        const { error } = replyOnCommentValiditionSchema(lang).validate({
            ...req.body,
            userId: userId
        });
        if (error) {
            return res.status(400).send({
                code:400,
                status: false,
                message: error.details[0].message
            });
        }
        const reply = await replyOnComment.create({
            ...req.body,
            userId: userId
        });
        res.status(200).send({
            code:200,
            status: true,
            message: messages.replyOnComment.addreplay,
            data: reply
        })

    }
    catch (err) {
        next(err)
    }
}
const getRepliesOnComment = async (req, res, next) => {
    try {
         const lang=req.headers['accept-language'] || 'en';
        const messages=getMessages(lang);
        const { commentId, tweetId } = req.params;
        if (
            !mongoose.Types.ObjectId.isValid(commentId) ||
            !mongoose.Types.ObjectId.isValid(tweetId)
        ) {
            return res.status(400).send({
                status:false,
                code:400,
                 message: messages.invalid.commentIdAndTweetId
             });
        }

        const replies = await replyOnComment.find({ commentId, tweetId })
            .populate("userId", "name")
            .sort({ date: -1 });

       return resstatus(200).send({ 
        message:messages.replyOnComment.getreplies,
         replies 
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addReply,
    getRepliesOnComment
}