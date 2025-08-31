const express=require("express");
const router=express.Router();
const {addCommentForUser}=require("../controllers/CommentForUser");
router.post("/add",addCommentForUser)











module.exports=router;