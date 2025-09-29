const express=require("express");
const router=express.Router();
const {getReels,addLike}=require("../controllers/reels");
router.get("/",getReels);
router.post("/addLike/:id",addLike)
module.exports=router;