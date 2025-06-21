const express = require("express");
const {addinvoice,getRevenue}= require("../controllers/invoice");
const router = express.Router();
router.post("/addinvoice", addinvoice);
router.get("/revenue", getRevenue);











module.exports = router;