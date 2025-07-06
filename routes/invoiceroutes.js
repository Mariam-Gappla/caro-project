const express = require("express");
const {addinvoice,getRevenue,getRevenueById}= require("../controllers/invoice");
const router = express.Router();
router.get("/invoiceDetails/:id",getRevenueById)
router.post("/addinvoice", addinvoice);
router.get("/", getRevenue);












module.exports = router;