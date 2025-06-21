const express= require("express");
const router = express.Router();
const {addRatingForOrder,getratingbyrentalOffice,getRatingByUser}=require("../controllers/ratingForOrder");
router.post("/add",addRatingForOrder);
router.get("/ratingForRentalOffice",getratingbyrentalOffice);
router.get("/ratingByUser",getRatingByUser);











module.exports = router;