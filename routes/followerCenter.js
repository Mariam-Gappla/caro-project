const express=require("express");
const router=express.Router();
const {addFollowerCenter,getAllFollowersForUser}=require("../controllers/followerCenter");
router.post("/",addFollowerCenter);
router.get("/",getAllFollowersForUser)





module.exports=router