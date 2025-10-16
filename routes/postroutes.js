const express = require('express');
const router = express.Router();
const upload=require("../configration/uploadFile");
const {addPost,getPostsByMainCategory,getPostById,getrelevantPosts,makeSearchByTitle,getProfilePosts,getNumberOfPostsWithStatus,deleteProfilePost,getEntityByTypeAndId,updateEntityByType,updateCreatedAt}=require("../controllers/post");
router.post("/",upload.fields([
    {name:"images"},
    {name:"video"}
]),addPost);
router.get("/search-title",makeSearchByTitle);
router.get("/profile-posts",getProfilePosts);
router.put("/update-post-profile",upload.array("images"),updateEntityByType);
router.post("/update-createdAt",updateCreatedAt);
router.get("/profile-type",getEntityByTypeAndId);
router.get("/number-status",getNumberOfPostsWithStatus)
router.delete("/profile-posts",deleteProfilePost);
router.get("/category/:categoryId",getPostsByMainCategory);
router.get("/:id",getPostById);
router.get("/relevant/:id",getrelevantPosts);









module.exports = router;