const express=require("express");
const router=express.Router();
const {addType,getTypes}=require("../controllers/carType");
router.get("/",getTypes);
router.post("/add",addType)
