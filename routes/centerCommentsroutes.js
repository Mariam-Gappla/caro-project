const express = require('express');
const router = express.Router();
const {addComment,getCommentsByPostId,getCommentsByShowRoomPostId,getPostCommentsWithReplies,getShowRoomPostCommentsWithReplies,getCommentsByCenterId,getCenterCommentswithReplies}=require("../controllers/centerComments");
router.post('/',addComment);
router.get('/post/:id',getCommentsByPostId);
router.get('/showroompost/:id',getCommentsByShowRoomPostId);
router.get("/post-comments-replies/:id",getPostCommentsWithReplies);
router.get("/showRoom-comments-replies/:id",getShowRoomPostCommentsWithReplies);
router.get("/center-comments/:id",getCommentsByCenterId);
router.get("/center-comments-replies/:id",getCenterCommentswithReplies)
module.exports = router;
