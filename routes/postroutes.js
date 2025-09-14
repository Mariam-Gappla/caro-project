const express = require('express');
const router = express.Router();
const upload=require("../configration/uploadFile");
const {addPost,getPostsByMainCategory}=require("../controllers/post");
router.post("/",upload.fields([
    {name:"images"},
    {name:"video"}
]),addPost);
router.get("/category/:categoryId",getPostsByMainCategory);










module.exports = router;