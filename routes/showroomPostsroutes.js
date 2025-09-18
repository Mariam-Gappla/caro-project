const express = require("express");
const router = express.Router();
const {addShowroomPost,getShowroomPosts,getPostById}=require("../controllers/showroomPosts");
const upload=require("../configration/uploadFile");
router.post("/",upload.fields([
    { name:"images"},
    { name:"video"}
]), addShowroomPost);
router.get("/",getShowroomPosts)
router.get("/:id",getPostById)






module.exports = router;