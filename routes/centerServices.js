const express=require("express");
const router=express.Router();
const {addCenterService,getCenterServiceByCenterId}=require("../controllers/centerServices");
router.post("/",addCenterService);
router.get("/:id",getCenterServiceByCenterId);







module.exports=router;