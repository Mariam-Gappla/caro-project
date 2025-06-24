const express=require("express");
const router=express.Router();
const {addVerficationForwinsh,addverficationForTire}=require("../controllers/serviceProviderVerification");
const upload=require("../configration/uploadFile");
router.post("/addForWinch",upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'nationalIdImage', maxCount: 1 },
  { name: 'licenseImage', maxCount: 1 },
  { name: 'carRegistrationImage', maxCount: 1 },
  { name: 'carImage', maxCount: 1 },
]),addVerficationForwinsh);
router.post("/addForTire",upload.fields([
  { name: 'profileImage', maxCount: 1 },
]),addverficationForTire)

















module.exports=router;