const express=require("express");
const router=express.Router();
const {addTweet,addLike,getTweetWithComments}=require("../controllers/tweet")
router.post("/add",addTweet);
router.patch("/like/:id",addLike);
router.get("/tweetwithcomments/:id",getTweetWithComments);

module.exports=router;