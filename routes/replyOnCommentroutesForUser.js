const express=require("express");
const router=express.Router();
const { addReplyForUser,getRepliesOnCommentForUser}=require("../controllers/replyOnCommentForUser");
router.post("/add",addReplyForUser);
router.get("/:commentId/:postId",getRepliesOnCommentForUser);
module.exports=router;