const express = require('express');
const router = express.Router();
const upload=require("../configration/uploadFile");
const {addPost,getPostsByMainCategory,getPostById,getrelevantPosts}=require("../controllers/post");
router.post("/",upload.fields([
    {name:"images"},
    {name:"video"}
]),addPost);
router.get("/category/:categoryId",getPostsByMainCategory);
router.get("/:id",getPostById);
router.get("/relevant/:id",getrelevantPosts)










module.exports = router;