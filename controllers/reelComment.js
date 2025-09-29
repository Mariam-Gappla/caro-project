const ReelComment = require("../models/reelsComment");
const ReelReply = require("../models/reelsReply");
const addComment = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const { content, reelId } = req.body;
        const userId = req.user.id;
        if ( !content || !reelId) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === 'ar' ? 'جميع الحقول مطلوبة' : 'All fields are required'
            });
        }
        await ReelComment.create({ content, reelId, userId });
        res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en" ? 'Comment added successfully' : 'تم إضافة التعليق بنجاح'
        });
    } catch (error) {
        next(error);
    }
}
const getCommentsByReelId = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const reelId = req.params.id;
        if (!reelId) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === 'ar' ? 'معرف المنشور مطلوب' : 'Post ID is required'
            });
        }
        const comments = await ReelComment.find({ reelId: reelId }).populate('userId', 'username image');
        const formatedComment = comments.map((comment) => {
            return {
                id: comment._id,
                content: comment.content,
                userData: {
                    username: comment.userId.username,
                    image: comment.userId.image,
                }
            }
        })
        res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en"
                ? "Your request has been completed successfully"
                : "تمت معالجة الطلب بنجاح",
            data: formatedComment
        });
    } catch (error) {
        next(error);
    }
}
const getReelCommentswithReplies = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const reelId = req.params.id;

        if (!reelId) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === "en" ? "reel ID is required" : "معرف الريلز مطلوب",
            });
        }

        // 📌 هات التعليقات الخاصة بالبوست
        const comments = await ReelComment.find({ reelId: reelId })
            .populate("userId", "username image") // المستخدم اللي كتب الكومنت
            .lean();

        // 📌 هات الـ replies لكل كومنت
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await ReelReply.find({ commentId: comment._id })
                    .populate("userId", "username image") // المستخدم اللي رد
                    .lean();

                return {
                    id: comment._id,
                    content: comment.content,
                    createdAt: comment.createdAt,
                    userData: {
                        username: comment.userId?.username,
                        image: comment.userId?.image,
                    },
                    replies: replies.map((reply) => ({
                        id: reply._id,
                        content: reply.content,
                        createdAt: reply.createdAt,
                        user: {
                            username: reply.userId?.username,
                            image: reply.userId?.image,
                        },
                    })),
                };
            })
        );

        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en"
                ? "Comments and replies retrieved successfully"
                : "تم جلب التعليقات والردود بنجاح",
            data: commentsWithReplies,

        });
    } catch (error) {
        next(error);
    }
}
module.exports = {
    addComment,
    getCommentsByReelId,
    getReelCommentswithReplies
}