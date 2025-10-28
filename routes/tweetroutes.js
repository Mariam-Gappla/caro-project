const express=require("express");
const router=express.Router();
const {addTweet,addLike,tweetsWithFullCommentCount,getTweetById,getCommentsAndRepliesForTweet}=require("../controllers/tweet");
const upload=require("../configration/uploadFile");
router.get("/",tweetsWithFullCommentCount)
router.post("/add", upload.fields([
    { name: "image"},
  ]),addTweet);
router.patch("/like/:id",addLike);
router.get("/commentsAndReplies/:id",getCommentsAndRepliesForTweet);
router.get("/:id",getTweetById);

module.exports=router;