const express=require("express");
const router=express.Router();
const {getAllRentallOffice,addLike,getRentalOfficeProfile}=require("../controllers/rentalOffice");
router.get("/all",getAllRentallOffice);
router.get("/overview",getRentalOfficeProfile);
router.patch("/Like/:id",addLike);
















module.exports=router;