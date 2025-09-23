const express=require("express");
const router=express.Router();
const {addCarPost,getCarPosts,getCarPostById}=require("../controllers/car");
const upload=require("../configration/uploadFile")
router.post("/",upload.fields([
    {name:'images'},
    {name:'video'}
]),addCarPost);
router.get("/",getCarPosts);
router.get("/:id",getCarPostById)

module.exports=router;