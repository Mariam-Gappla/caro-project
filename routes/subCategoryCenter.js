const express = require("express");
const router = express.Router();
const { addSubCategoryCenter, getAllSubCategoryCenter } = require("../controllers/subCategoryCenter");
router.post("/", addSubCategoryCenter);
router.get("/:id", getAllSubCategoryCenter);
module.exports = router;