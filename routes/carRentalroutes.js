const express=require("express");
const router=express.Router();
const {addCar,getCarsByRentalOffice}=require("../controllers/carRental");
const upload=require("../configration/uploadFile");
router.post("/addcar",upload.array('images', 10),addCar);
router.get("/carsbyrentaloffice",getCarsByRentalOffice)









module.exports=router;