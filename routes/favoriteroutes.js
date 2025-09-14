const express=require("express");
const router=express.Router();
const {toggleFavorite,getFavoritesForUser}=require("../controllers/favorite")
router.post("/",toggleFavorite);
router.get("/",getFavoritesForUser)








module.exports=router