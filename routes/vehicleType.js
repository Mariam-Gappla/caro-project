const express = require("express");
const router = express.Router();
const {addVehicleType,getVehicleType}= require("../controllers/vehicleType");
router.post("/", addVehicleType);
router.get("/", getVehicleType);



module.exports=router;