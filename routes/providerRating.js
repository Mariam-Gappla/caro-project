const express= require("express");
const router = express.Router();
const {addProviderRating}= require("../controllers/providerRating");
router.post("/add",addProviderRating);
module.exports=router;