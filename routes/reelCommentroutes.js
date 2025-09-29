const express=require("express");
const router=express.Router();
const { addComment,getCommentsByReelId,getReelCommentswithReplies}=require("../controllers/reelComment");
router.post("/",addComment);
router.get("/:id",getCommentsByReelId);
router.get("/comments-replies/:id",getReelCommentswithReplies)
module.exports=router;