const express=require("express");
const router=express.Router();
const {addOrder,ordersForRentalOffice,getOrdersForRentalOfficeByWeekDay,getOrderById,acceptorder,getOrders,getBookedDays}=require("../controllers/rentalOfficeOrders");
const upload=require("../configration/uploadFile");
router.get("/",ordersForRentalOffice)
router.get("/OrdersByWeekDay",getOrdersForRentalOfficeByWeekDay);
router.get("/reportOrder",getOrders)
router.get('/booked-days/:carId', getBookedDays);
router.get("/orderdetails/:orderId",getOrderById);
router.post("/acceptOrder/:orderId",upload.any(),acceptorder);
router.post("/add/:id",upload.any(),addOrder);









module.exports=router;