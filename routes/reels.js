const express=require("express");
const router=express.Router();
const {getReels}=require("../controllers/reels");
router.get("/",getReels);
module.exports=router;