const express=require("express");
const router=express.Router();
const {addDeliveryOption,getDeliveryOption}=require("../controllers/deliveryOption")
router.post("/",addDeliveryOption);
router.get("/",getDeliveryOption);
module.exports=router;