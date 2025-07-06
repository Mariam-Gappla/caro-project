const express=require("express");
const router=express.Router();
const {addCar,getCarsByRentalOfficeForUser,getCarById}=require("../controllers/carRental");
const upload=require("../configration/uploadFile");
router.post("/addcar",upload.array('images', 10),addCar);
router.get("/carsbyrentaloffice/:id",getCarsByRentalOfficeForUser);
router.get("/:id",getCarById);








module.exports=router;