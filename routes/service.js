const express = require("express");
const router = express.Router();
const {addService,getServicesInCenter} =require("../controllers/service");
const upload=require("../configration/uploadFile")
router.post("/:id",upload.single("image"),addService);
router.get("/:id",getServicesInCenter)
module.exports = router;