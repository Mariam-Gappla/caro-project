const express=require("express");
const router=express.Router();
const {startTracking,endTracking}=require("../controllers/tracking");
router.post("/start",startTracking);
router.post("/end",endTracking);


module.exports=router