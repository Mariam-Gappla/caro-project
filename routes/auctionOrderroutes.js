const express=require("express");
const router=express.Router();
const {placeBid}=require("../controllers/auctionOrder")
router.post("/",placeBid);






module.exports=router