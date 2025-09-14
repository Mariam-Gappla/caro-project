const express=require("express");
const router=express.Router();
const {addTweet,addLike,getTweetWithCommentsAndReplies,tweetsWithFullCommentCount}=require("../controllers/tweet");
const upload=require("../configration/uploadFile");
router.get("/",tweetsWithFullCommentCount)
router.post("/add", upload.fields([
    { name: "image"},
  ]),addTweet);
router.patch("/like/:id",addLike);
router.get("/tweetwithcomments/:id",getTweetWithCommentsAndReplies);

module.exports=router;