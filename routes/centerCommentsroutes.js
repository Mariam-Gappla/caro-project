const express = require('express');
const router = express.Router();
const {addComment,getCommentsByPostId,getCommentsByShowRoomPostId,getPostCommentsWithReplies,getShowRoomPostCommentsWithReplies}=require("../controllers/centerComments");
router.post('/',addComment);
router.get('/post/:id',getCommentsByPostId);
router.get('/showroompost/:id',getCommentsByShowRoomPostId);
router.get("/post-comments-replies/:id",getPostCommentsWithReplies);
router.get("/showRoom-comments-replies/:id",getShowRoomPostCommentsWithReplies)
module.exports = router;
