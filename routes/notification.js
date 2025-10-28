const express=require("express");
const router=express.Router();
const {getNotifications,addNotification,updateRead}=require("../controllers/notification")
router.get("/",getNotifications);
router.post("/add",addNotification);
router.post("/isRead/:id",updateRead)
module.exports=router;