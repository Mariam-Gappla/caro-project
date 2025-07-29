const express = require('express');
const router = express.Router();
const upload = require('../configration/uploadFile');
const { addHowToUseCaro,getVideos} = require('../controllers/howToUseCaro');
router.post('/add', upload.array('videos', 3), addHowToUseCaro);
router.get("/",getVideos);
module.exports=router