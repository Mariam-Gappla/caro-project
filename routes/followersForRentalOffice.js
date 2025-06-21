const express=require("express");
const router=express.Router();
const {addFollower,getFollowersForRentalOffice}=require("../controllers/followersForRentalOffice");
router.post("/addfollower/:rentalOfficeId",addFollower);
router.get("/getfollowers",getFollowersForRentalOffice);


















module.exports=router;