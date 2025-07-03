const express=require("express");
const router=express.Router();
const {addOrder,ordersForRentalOfficewithstatus,getOrdersForRentalOfficeByWeekDay,getOrderById,acceptorder,getOrders,getBookedDays, getOrdersByRentalOffice,isAvailable, getRentalOfficeStatistics}=require("../controllers/rentalOfficeOrders");
const upload=require("../configration/uploadFile");
router.get("/",ordersForRentalOfficewithstatus)
router.get("/OrdersByWeekDay",getOrdersForRentalOfficeByWeekDay);
router.get("/rentalOffice",getOrdersByRentalOffice);
router.get("/reportOrder",getOrders)
router.get('/booked-days/:carId', getBookedDays);
router.get("/orderdetails/:orderId",getOrderById);
router.post("/acceptOrder/:orderId",upload.any(),acceptorder);
router.post("/add/:id",upload.any(),addOrder);
router.patch("/available/:id",isAvailable)
router.get("/statistics",getRentalOfficeStatistics)









module.exports=router;