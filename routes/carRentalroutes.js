const express=require("express");
const router=express.Router();
const {addCar,getCarsByRentalOfficeForUser,getCarById,updateCar,deleteCar,getSearchCar}=require("../controllers/carRental");
const upload=require("../configration/uploadFile");
router.post("/addcar",upload.array('images', 10),addCar);
router.get("/search",getSearchCar);
router.get("/carsbyrentaloffice/:id",getCarsByRentalOfficeForUser);
router.put("/:id",upload.array('images', 10),updateCar)
router.get("/:id",getCarById);
router.delete("/:id",deleteCar);








module.exports=router;