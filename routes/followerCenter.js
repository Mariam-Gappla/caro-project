const express=require("express");
const router=express.Router();
const {addFollowerCenter}=require("../controllers/followerCenter");
router.post("/",addFollowerCenter)





module.exports=router