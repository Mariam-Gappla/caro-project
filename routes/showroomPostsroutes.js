const express = require("express");
const router = express.Router();
const {addShowroomPost,getShowroomPosts,getPostById,buyCar}=require("../controllers/showroomPosts");
const upload=require("../configration/uploadFile");
router.post("/",upload.fields([
    { name:"images"},
    { name:"video"}
]), addShowroomPost);
router.post("/buyCar", buyCar)
router.get("/posts/:showroomId",getShowroomPosts)
router.get("/:id",getPostById)






module.exports = router;