const express=require("express");
const router=express.Router();
const {addAdvantage,getAdvantage}=require("../controllers/advantages");
router.post("/",addAdvantage);
router.get("/",getAdvantage);


module.exports=router;