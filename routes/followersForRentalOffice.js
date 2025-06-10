const express=require("express");
const router=express.Router();
const {addFollower}=require("../controllers/followersForRentalOffice");
router.post("/addfollower/:id",addFollower)

















module.exports=router;