const express=require("express");
const router=express.Router();
const {addPost,getPosts,getPostById}=require("../controllers/search");
const upload=require("../configration/uploadFile");
router.post("/",upload.fields([
    {name:"images"},
    {name:"video"}
]),addPost);
router.get("/",getPosts);
router.get("/:id",getPostById)
module.exports=router;