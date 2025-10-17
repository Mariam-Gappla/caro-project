const express = require("express");
const router = express.Router();
const {addFaq, getFaqs } = require("../controllers/faq.js");
router.post("/", addFaq);
router.get("/", getFaqs);
module.exports = router;