const express = require('express');
const router = express.Router();
const {addCarPlatePost, getCarPlatesPosts,getCarPlatesPostById}=require("../controllers/carPlate");
router.post("/",addCarPlatePost);
router.get("/", getCarPlatesPosts);
router.get("/:id", getCarPlatesPostById);






module.exports=router;