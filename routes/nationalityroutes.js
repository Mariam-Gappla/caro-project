const express = require("express");
const router = express.Router();
const {addNationality,getNationality}=require("../controllers/nationality")
router.post("/", addNationality);
router.get("/", getNationality);
module.exports = router;