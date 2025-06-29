const express=require("express");
const router=express.Router();
const {addTweet,addLike,getTweetWithCommentsAndReplies}=require("../controllers/tweet");
const upload=require("../configration/uploadFile");
router.post("/add",upload.single("image"),addTweet);
router.patch("/like/:id",addLike);
router.get("/tweetwithcomments/:id",getTweetWithCommentsAndReplies);

module.exports=router;