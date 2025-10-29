const express=require("express");
const router=express.Router();
const {register,login,resetPassword,requestResetPassword,logout,
    addLocationForProvider,changePassword,getProfileData,editProfile,
userAsProvider,acceptUserAsProvider,getCenters,getProfileDataForCenters,verifyCode,getUserData,userAsAutoSalvage}=require('../controllers/user.js');
const upload=require("../configration/uploadFile.js");
router.post("/register",register);
router.post("/add-location",addLocationForProvider);
router.post("/login",login);
router.post("/request-reset-password", requestResetPassword)
router.post("/reset-password",resetPassword)
router.post("/logout",logout);
router.put("/change-password",changePassword);
router.put("/editProfile",upload.single("image"),editProfile);
router.post("/become-provider",upload.single("image"),userAsProvider);
router.put("/accept-user-as-provider/:userId",acceptUserAsProvider);
router.get("/get-centers/:id",getCenters);
router.get("/",getProfileData);
router.get("/get-center-profile/:id",getProfileDataForCenters);
router.get("/user-data",getUserData);
router.post("/userAsAutoSalvage",upload.single("image"),userAsAutoSalvage);
router.post("/verify-code",verifyCode);
module.exports=router;