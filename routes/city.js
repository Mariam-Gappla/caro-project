const express=require("express");
const router=express.Router();
const { addCity,getCities}=require("../controllers/city");
router.post("/",addCity);
router.get("/",getCities)







module.exports=router;