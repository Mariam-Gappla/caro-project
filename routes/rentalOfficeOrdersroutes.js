const express=require("express");
const router=express.Router();
const {addOrder,ordersForRentalOffice}=require("../controllers/rentalOfficeOrders")
router.get("/",ordersForRentalOffice)
router.post("/add/:id",addOrder);








module.exports=router;