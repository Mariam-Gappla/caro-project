const express=require("express");
const router=express.Router();
const {addPost}=require("../controllers/slavgPost");
const upload=require("../configration/uploadFile");
router.post("/",upload.fields([
    {name:"images"},
]),addPost);
module.exports=router;