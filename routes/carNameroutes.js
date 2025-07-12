const express=require("express");
const router=express.Router();
const {addName,getNames}=require("../controllers/carName");
router.get("/",getNames);
router.post("/",addName)









module.exports=router