const express=require("express");
const router=express.Router();
const {addWinchOrder,addTireOrder,getUserMakeOrderandRating,getOrdersbyServiceType,changeStatusForOrder,ordersAndProfit,reportForProvider,getOrdersByServiceProvider,getOrderById,endOrder}=require("../controllers/serviceProviderOrders");
const upload= require("../configration/uploadFile");
router.post("/winch",upload.single("image"),addWinchOrder);
router.post("/others",upload.single("image"),addTireOrder);
router.get("/userandRating/:id",getUserMakeOrderandRating);
router.get("/",getOrdersbyServiceType);
router.get("/ordersAndProfit",ordersAndProfit);
router.get("/report",reportForProvider);
router.get("/ordersForProvider",getOrdersByServiceProvider)
router.post("/changeStatus",changeStatusForOrder);
router.get("/OrderById/:id",getOrderById);
router.put("/endOrder", endOrder)
module.exports=router;