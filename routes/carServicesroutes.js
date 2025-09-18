const express = require("express");
const router = express.Router();
const { addCarServices, getServices } = require("../controllers/carServices");
router.post("/", addCarServices);
router.get("/", getServices);
module.exports = router;