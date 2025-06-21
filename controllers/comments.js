const Comment = require("../models/comments");
const { commentValidationSchema } = require("../validation/commentvalidition")
const addComment = async (req, res, next) => {
    try {
        const lang=req.headers['accept-language'] || 'en'
        const { error } = commentValidationSchema(lang).validate(req.body);
        if (error) {
            return res.status(400).send({
                code:400,
                status: false,
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
        status:true,
        code:200,
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