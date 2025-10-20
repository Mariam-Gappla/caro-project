const express=require("express");
const router=express.Router();
const {addPost,endPost}=require("../controllers/slavgPost");
const upload=require("../configration/uploadFile");
router.post("/",upload.fields([
    {name:"images"},
]),addPost);
router.post("/end/:id",endPost);
module.exports=router;