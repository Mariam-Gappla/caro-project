const express=require("express");
const router=express.Router();
const {startSession, stopSession} = require("../controllers/workingSession");
router.put("/startSession", startSession);
router.put("/stopSession", stopSession);
module.exports=router;