const express=require("express");
const router=express.Router();
const {addBatteryPricing,addTirePricing,addWinchPricing,getPricing}=require("../controllers/serviceProviderPrice");
router.get("/",getPricing)
router.post("/winch-pricing",addWinchPricing);
router.post("/tire-pricing",addTirePricing);
router.post("/battery-pricing",addBatteryPricing);
module.exports=router;
