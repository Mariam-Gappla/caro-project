const express=require("express");
const router=express.Router();
const {addWinchOrder,addTireOrder}=require("../controllers/serviceProviderOrders");
const upload= require("../configration/uploadFile");
router.post("/winch",upload.single("image"),addWinchOrder);
router.post("/others",upload.single("image"),addTireOrder);
module.exports=router;