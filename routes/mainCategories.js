const express=require("express");
const router=express.Router();
const{allMainCategories,addMainCategory}=require("../controllers/mainCategories");
router.post("/add",addMainCategory);
router.get("/",allMainCategories);
module.exports=router