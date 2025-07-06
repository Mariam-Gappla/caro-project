const express=require("express");
const router=express.Router();
const {getNotifications,addNotification}=require("../controllers/notification")
router.get("/",getNotifications);
router.post("/add",addNotification)
module.exports=router;