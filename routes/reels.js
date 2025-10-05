const express=require("express");
const router=express.Router();
const {getReels,addLike,makeShare}=require("../controllers/reels");
router.get("/",getReels);
router.post("/addLike/:id",addLike);
router.post("/makeShare",makeShare)
module.exports=router;