const express=require("express");
const router=express.Router();
const {addModel,getModels}=require("../controllers/carModel");
router.get("/",getModels);
router.post("/",addModel);








module.exports=router