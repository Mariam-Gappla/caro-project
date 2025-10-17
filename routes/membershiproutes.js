const express=require("express");
const router=express.Router();
const {addMembership,getMemberships}=require("../controllers/membership");
router.post("/",addMembership);
router.get("/",getMemberships);
module.exports=router;