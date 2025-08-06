const express=require("express");
const router=express.Router();
const {addOrder,ordersForRentalOfficewithstatus,getOrdersForRentalOfficeByWeekDay,getOrderById,acceptorder,getOrders,endOrder,getBookedDays, getOrdersByRentalOffice}=require("../controllers/rentalOfficeOrders");
const upload=require("../configration/uploadFile");
router.get("/",ordersForRentalOfficewithstatus)
router.get("/OrdersByWeekDay",getOrdersForRentalOfficeByWeekDay);
router.get("/rentalOffice",getOrdersByRentalOffice);
router.get("/reportOrder",getOrders)
router.get('/booked-days/:carId', getBookedDays);
router.get("/orderdetails/:orderId",getOrderById);
router.put("/endOrder/:id",endOrder);
router.post("/acceptOrder/:orderId",upload.any(),acceptorder);
router.post("/add/:id",upload.any(),addOrder);










module.exports=router;