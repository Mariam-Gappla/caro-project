const express= require("express");
const router = express.Router();
const {addRatingForOrderToRentalOffice,addRatingForOrderToServiceProvider,getratingbyrentalOffice,getRatingByUser,getRatingByServiceProvider}=require("../controllers/ratingForOrder");
router.post("/addforRentalOffice",addRatingForOrderToRentalOffice);
router.post("/addforServiceProvider",addRatingForOrderToServiceProvider);
router.get("/ratingForRentalOffice",getratingbyrentalOffice);
router.get("/ratingByUser",getRatingByUser);
router.get("/ratingByServiceProvider",getRatingByServiceProvider);
module.exports = router;