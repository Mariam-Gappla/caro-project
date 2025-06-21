const express=require("express");
const router=express.Router();
const {addReply,getRepliesOnComment}=require("../controllers/replyOnComment");
router.post("/add",addReply);
router.get("/:commentId/:tweetId",getRepliesOnComment);
module.exports=router;