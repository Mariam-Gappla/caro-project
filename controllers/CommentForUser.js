const {CommentForUser}=require("../models/commentForUser");
const { commentForUserValidationSchema } = require("../validation/commentForUserValidition");
const addCommentForUser = async (req, res, next) => {
    try {
        const lang=req.headers['accept-language'] || 'en'
        const { error } = commentForUserValidationSchema(lang).validate(req.body);
        if (error) {
            return res.status(400).send({
                code:400,
                status: false,
                message: error.details[0].message
            });
        }
        const id=req.user.id;
        const {content , postId}=req.body;
        const comment= await CommentForUser.create({
            content:content,
            userId:id,
            postId:postId
        });  
      res.status(200).send({
        status:true,
        code:200,
        message:"تم اضافه التعليق بنجاح",
        data: {
        id: comment._id
      }
      })
    }
    catch (err) {
        next(err)
    }
}
module.exports={
    addCommentForUser
}