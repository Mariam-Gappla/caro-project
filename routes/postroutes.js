const express = require('express');
const router = express.Router();
const upload=require("../configration/uploadFile");
const {addPost,getPostsByMainCategory,getPostById,getrelevantPosts,makeSearchByTitle,getProfilePosts,deleteProfilePost,updateEntityByType}=require("../controllers/post");
router.post("/",upload.fields([
    {name:"images"},
    {name:"video"}
]),addPost);
router.get("/search-title",makeSearchByTitle);
router.get("/profile-posts",getProfilePosts);
router.put("/update-post-profile",upload.array("images"),updateEntityByType);
router.delete("/profile-posts",deleteProfilePost);
router.get("/category/:categoryId",getPostsByMainCategory);
router.get("/:id",getPostById);
router.get("/relevant/:id",getrelevantPosts);









module.exports = router;