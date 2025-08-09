const express=require("express");
const router=express.Router();
const {getAllRentallOffice,addLike,getRentalOfficeCar,getProfileData,editRentalOfficeProfile}=require("../controllers/rentalOffice");
router.get("/all",getAllRentallOffice);
router.get("/overview",getRentalOfficeCar);
router.get("/profileData",getProfileData)
router.patch("/Like/:id",addLike);
router.put("/rentalOffice",editRentalOfficeProfile)
















module.exports=router;