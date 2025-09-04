const express=require("express");
const router=express.Router();
const {addRatingCenter}=require("../controllers/ratingCenter");
router.post("/",addRatingCenter);





module.exports=router