const express=require("express");
const router=express.Router();
const {getAllRentallOffice,getRentalOfficeCar,getProfileData,rentalOfficeVerified}=require("../controllers/rentalOffice");
const upload=require("../configration/uploadFile");
router.get("/all",getAllRentallOffice);
router.get("/overview",getRentalOfficeCar);
router.get("/profileData",getProfileData)
router.post("/rentalOffice-verify",upload.single("image"),rentalOfficeVerified);















module.exports=router;