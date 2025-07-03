const express=require("express");
const router=express.Router();
const {getRentalOfficeNotifications}=require("../controllers/notification")
router.get("/",getRentalOfficeNotifications);
module.exports=router;