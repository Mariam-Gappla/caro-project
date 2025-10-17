const express=require("express");
const router=express.Router();
const {addName,getNames}=require("../controllers/carName");
const upload=require("../configration/uploadFile");
router.get("/",getNames);
router.post("/",upload.single("image"),addName)









module.exports=router