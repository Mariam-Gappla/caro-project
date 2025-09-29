const express=require("express");
const router=express.Router();
const {addReply,getReplies}=require("../controllers/reelReply")
router.post("/",addReply);
router.get("/:id",getReplies);

module.exports=router;