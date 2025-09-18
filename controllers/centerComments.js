const CenterComment = require('../models/centerComments');
const addComment = async (req,res,next)=>{
    try {
        const lang = req.headers['accept-language'] || 'en';
        const {entityType, content,entityId} = req.body;
        const userId=req.user.id;
        if (!entityType || !content || !entityId) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === 'ar' ? 'جميع الحقول مطلوبة' : 'All fields are required'
            });
        }
        await CenterComment.create({entityType, content, entityId, userId});
        res.status(200).send({
            status:true,
            code:200,
            message:lang=="en"? 'Comment added successfully': 'تم إضافة التعليق بنجاح'
        });
    } catch (error) {
        next(error);
    }
}
const getCommentsByPostId=async (req,res,next)=>{
    try {
        const lang = req.headers['accept-language'] || 'en';
        const postId = req.params.id;
        if (!postId) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === 'ar' ? 'معرف المنشور مطلوب' : 'Post ID is required'
            });
        }
        const comments = await CenterComment.find({entityId:postId,entityType:"Post"}).populate('userId','username image');
        res.status(200).send({
            status:true,
            code:200,
            data:comments
        });
    } catch (error) {
        next(error);
    }
}
const getCommentsByShowRoomPostId=async (req,res,next)=>{
    try {
        const lang = req.headers['accept-language'] || 'en';
        const postId = req.params.id;
        if (!postId) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === 'ar' ? 'معرف المنشور مطلوب' : 'Post ID is required'
            });
        }
    } catch (error) {
        next(error);
    }
    const comments = await CenterComment.find({entityId:postId,entityType:"ShowRoomPosts"}).populate('userId','username image');
    res.status(200).send({
        status:true,
        code:200,
        data:comments
    });
}
module.exports = {
    addComment,
    getCommentsByPostId,
    getCommentsByShowRoomPostId
}