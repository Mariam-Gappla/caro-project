const express = require("express");
const router = express.Router();
const upload = require("../configration/uploadFile")
const { addCenterService, getCenterServiceByCenterId } = require("../controllers/centerServices");
router.post("/", upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 }
]), addCenterService);
router.get("/:id", getCenterServiceByCenterId);







module.exports = router;