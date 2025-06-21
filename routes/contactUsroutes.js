const express = require('express');
const router = express.Router();
const {addcontactUs}= require("../controllers/contactUs");
router.post("/sendMessage",addcontactUs);











module.exports = router;