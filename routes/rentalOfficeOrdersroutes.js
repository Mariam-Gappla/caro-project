const express=require("express");
const router=express.Router();
const {addOrder,ordersForRentalOfficewithstatus,getOrdersStatisticsByWeekDay,getReportData,getOrderById,acceptorder,getOrders,endOrder,getBookedDays, getOrdersByRentalOffice}=require("../controllers/rentalOfficeOrders");
const upload=require("../configration/uploadFile");
router.get("/",ordersForRentalOfficewithstatus)
router.get("/OrdersByWeekDay",getOrdersStatisticsByWeekDay);
router.get("/rentalOffice",getOrdersByRentalOffice);
router.get("/reportData",getReportData);
router.get("/reportOrder",getOrders)
router.get('/booked-days/:carId', getBookedDays);
router.get("/orderdetails/:orderId",getOrderById);
router.put("/endOrder/:id",endOrder);
router.post("/acceptOrder/:orderId",upload.any(),acceptorder);
router.post("/add/:id",upload.any(),addOrder);










module.exports=router;