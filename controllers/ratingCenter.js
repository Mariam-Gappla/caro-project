const RatingCenter = require("../models/ratingCenter");
const { ratingCenterSchemaValidation } = require("../validation/ratingCenter");
const mongoose = require("mongoose")
const addRatingCenter = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const userId = req.user.id;
        const centerId = req.body.centerId;
        const { error } = ratingCenterSchemaValidation(lang).validate({
            ...req.body
        });
        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message
            });
        }
        const existanceRating = await RatingCenter.findOne({ userId: new mongoose.Types.ObjectId(userId), centerId: new mongoose.Types.ObjectId(centerId), })
        if (existanceRating) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang == "en"?"you added rating for this center":"قد اضفت تقييم لهذا المركز من قبل"
            });
        }
        await RatingCenter.create({
            userId: new mongoose.Types.ObjectId(userId),
            centerId: new mongoose.Types.ObjectId(centerId),
            ...req.body
        })
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en" ? "rating added sucessfully" : "تم اضافه التقييم بنجاح"
        })
    }
    catch (err) {
        next(err)
    }
}
module.exports = {
    addRatingCenter
}