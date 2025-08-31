const express=require("express");
const router=express.Router();
const {addArea,getArea}=require("../controllers/area");
router.get("/:cityId",getArea)
router.post("/",addArea)







module.exports=router