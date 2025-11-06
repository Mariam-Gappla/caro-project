const express=require("express");
const router=express.Router();
const {placeBid,addOrder, acceptOrRefusedAuctionOrder}=require("../controllers/auctionOrder")
router.post("/add-order",addOrder);
router.post("/accept-refuse",acceptOrRefusedAuctionOrder);
router.post("/",placeBid);






module.exports=router