const express=require("express");
const router=express.Router();
const {addFuelType,getFuelType}=require("../controllers/fuelType")
router.post("/",addFuelType);
router.get("/",getFuelType);
module.exports=router;