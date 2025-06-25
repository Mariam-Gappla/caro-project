const express=require("express");
const router=express.Router();
const {allMessages}=require("../controllers/chat");
router.get("/oldChat/:chatId",allMessages);










module.exports=router