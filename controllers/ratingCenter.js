const RatingCenter = require("../models/ratingCenter");
const { ratingCenterSchemaValidation } = require("../validation/ratingCenter");
const addRatingCenter = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const userId = req.user.id;

        const { error } = ratingCenterSchemaValidation.validate({
            ...req.body
        });
        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message
            });
        }
        await RatingCenter.create({
            userId: userId,
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