const express=require("express");
const router=express.Router();
const {addSubCategory,updateSubCategory,deleteSubCategory,getSubCategories,getSubCategoriesInMainCategory}=require("../controllers/subCategory");
router.get("/",getSubCategories);
router.post("/add/:id",addSubCategory);
router.patch("/update/:id",updateSubCategory);
router.delete("/delete/:id",deleteSubCategory)
router.get("/subCategoriesInMain/:id",getSubCategoriesInMainCategory)










module.exports=router