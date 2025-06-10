const Comment = require("../models/comments");
const { commentValidationSchema } = require("../validation/commentvalidition")
const addComment = async (req, res, next) => {
    try {
        const { error } = commentValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).send({
                status: res.statusCode,
                message: error.details[0].message
            });
        }
        const id=req.user.id;
        const {content , tweetId}=req.body;
        await Comment.create({
            content:content,
            userId:id,
            tweetId:tweetId
        });  
      res.status(200).send({
        status:res.status,
        message:"تم اضافه التعليق بنجاح",
      })
    }
    catch (err) {
        next(err)
    }
}
module.exports={
    addComment
}