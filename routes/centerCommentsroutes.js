const express = require('express');
const router = express.Router();
const {addComment,getCommentsByPostId,getCommentsByShowRoomPostId}=require("../controllers/centerComments");
router.post('/',addComment);
router.get('/post/:id',getCommentsByPostId);
router.get('/showroompost/:id',getCommentsByShowRoomPostId);
module.exports = router;
