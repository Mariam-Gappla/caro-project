const express=require("express");
const router=express.Router();
const {addComment}=require("../controllers/comments")
router.post("/add",addComment)











module.exports=router;