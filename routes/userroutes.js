const express=require("express");
const router=express.Router();
const {register,login,resetPassword,requestResetPassword,logout}=require('../controllers/user.js');
router.post("/register",register);
router.post("/login",login);
router.post("/request-reset-password", requestResetPassword)
router.post("/reset-password",resetPassword)
router.post("/logout",logout)
module.exports=router;