const express = require("express");
const router = express.Router();
const { addPackage, getPackages } = require("../controllers/packages.js");
router.post("/", addPackage);
router.get("/", getPackages);
module.exports = router;