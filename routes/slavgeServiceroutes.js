const express=require("express");
const router=express.Router();
const {addSlavgeService,getSlaveServices}=require("../controllers/slavgeService");
router.post("/",addSlavgeService);
router.get("/",getSlaveServices);
module.exports=router;