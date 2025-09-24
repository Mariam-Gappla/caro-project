const express=require("express");
const router=express.Router();
const {addCylinder,getCylinder}=require("../controllers/cylinder")
router.post("/",addCylinder);
router.get("/",getCylinder);
module.exports=router;