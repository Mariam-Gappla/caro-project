const express=require("express");
const router=express.Router();
const {addPost,endPost,getPosts,getPostById}=require("../controllers/slavgPost");
const upload=require("../configration/uploadFile");
router.post("/",upload.fields([
    {name:"images"},
]),addPost);
router.post("/end/:id",endPost);
router.get("/:id", getPostById)
router.get("/",getPosts)
module.exports=router;