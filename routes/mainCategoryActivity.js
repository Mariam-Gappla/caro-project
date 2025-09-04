const express=require("express");
const router=express.Router();
const {addMainCategoryActivity,getAllMainCategoryActivity}=require("../controllers/mainCategoryActivity")
router.post("/",addMainCategoryActivity);
router.get("/",getAllMainCategoryActivity);
module.exports=router