const express=require("express");
const router=express.Router();
const {addMessage,getMessagesBetweenTwoUsers,getConversations,markConversationAsRead}=require("../controllers/userChat")
router.post("/",addMessage);
router.get("/:id",getMessagesBetweenTwoUsers);
router.get("/",getConversations);
router.post("/isRead",markConversationAsRead)


module.exports=router;