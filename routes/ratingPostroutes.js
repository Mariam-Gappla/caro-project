const express=require("express");
const router=express.Router();
const {addRating,getPostRatings}=require("../controllers/ratingPost");
router.post("/",addRating);
router.get("/:id",getPostRatings)
module.exports=router;