const express=require("express");
const router=express.Router();
const {addTransimission,getTransimission}=require("../controllers/transmission")
router.post("/",addTransimission);
router.get("/",getTransimission);
module.exports=router;