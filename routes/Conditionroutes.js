const express=require("express");
const router=express.Router();
const {addCondition,getCondition}=require("../controllers/Condition");
router.post("/",addCondition);
router.get("/",getCondition);
module.exports=router;