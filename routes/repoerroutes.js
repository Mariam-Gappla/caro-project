const express=require("express");
const router=express.Router();
const {addReport}=require("../controllers/report")
router.post("/",addReport);









module.exports=router