const express=require("express");
const router=express.Router();
const {addCarBody,getCarBody}=require("../controllers/carBody");
router.post("/",addCarBody);
router.get("/",getCarBody);
module.exports=router;