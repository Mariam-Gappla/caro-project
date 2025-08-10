const express=require("express");
const router=express.Router();
const {register,login,resetPassword,requestResetPassword,logout,addLocationForProvider,changePassword,getProfileData}=require('../controllers/user.js');
router.post("/register",register);
router.post("/add-location",addLocationForProvider);
router.post("/login",login);
router.post("/request-reset-password", requestResetPassword)
router.post("/reset-password",resetPassword)
router.post("/logout",logout);
router.put("/change-password",changePassword);
router.get("/",getProfileData);
module.exports=router;