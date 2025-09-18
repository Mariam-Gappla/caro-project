const CenterReply = require("../models/centerReplies");
const addReply = async (req,res,next)=>{
    try {
        const lang = req.headers['accept-language'] || 'en';
        const {commentId, content} = req.body;
        const userId=req.user.id;
        if (!commentId || !content) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === 'ar' ? 'جميع الحقول مطلوبة' : 'All fields are required'
            });
        }
        await CenterReply.create({commentId, content, userId});
        res.status(200).send({
            status:true,
            code:200,
            message:lang=="en"? 'Reply added successfully': 'تم إضافة الرد بنجاح'
        });
    } catch (error) {
        next(error);
    }
}
const getReplies=async (req,res,next)=>{
    try {
        const lang = req.headers['accept-language'] || 'en';
        const {commentId} = req.params;
        if (!commentId) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === 'ar' ? 'معرف التعليق مطلوب' : 'Comment ID is required'
            });
        }
        const replies = await CenterReply.find({commentId}).populate('userId', 'username image');
        res.status(200).send({
            status:true,
            code:200,
            data:replies
        });
    } catch (error) {
        next(error);
    }
}
module.exports = {
    addReply,
    getReplies
}