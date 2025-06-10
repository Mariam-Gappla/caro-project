const express=require("express");
const router=express.Router();
const {getAllRentallOffice,addLike}=require("../controllers/rentalOffice");
router.get("/all",getAllRentallOffice);
router.patch("/Like/:id",addLike)















module.exports=router;