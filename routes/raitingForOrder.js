const express= require("express");
const router = express.Router();
const {addRatingForOrder,getratingbyrentalOffice,getRatingByUser,getRatingByServiceProvider}=require("../controllers/ratingForOrder");
router.post("/add",addRatingForOrder);
router.get("/ratingForRentalOffice",getratingbyrentalOffice);
router.get("/ratingByUser",getRatingByUser);
router.get("/ratingByServiceProvider",getRatingByServiceProvider)











module.exports = router;