const express = require("express");
const router = express.Router();
const { addMainCategoryCenter,getAllMainCategoryCenter } = require("../controllers/mainCategoryCenter");
router.post("/", addMainCategoryCenter);
router.get("/", getAllMainCategoryCenter);
module.exports = router;