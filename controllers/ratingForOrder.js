const review = require("../models/ratingForOrder");
const ratingSchemaValidation = require("../validation/ratingForRentalOfficeValidition");
const rentalOfficeOrder = require("../models/rentalOfficeOrders");
const getMessages = require("../configration/getmessages");
const addRatingForOrder = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        const userId = req.user.id;
        const { error } = ratingSchemaValidation.ratingSchemaValidation(lang).validate(req.body);
        if (error) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: error.details[0].message
            });
        }
        const { orderId, targetType, rating, comment } = req.body;
        const existOrder = await rentalOfficeOrder.findById(orderId);
        if (!existOrder) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.order.notExist
            });
        }
        const existingRating = await review.findOne({ userId, orderId });
        if (existingRating) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.rating.alreadyRated
            });
        }
        if (existOrder.paymentStatus == 'paid' || existOrder.isAvailable == "true") {
            const ratingData = {
                userId: userId,
                orderId: orderId,
                targetId: existOrder.rentalOfficeId,
                targetType,
                rating,
                comment
            }
            await review.create(ratingData);
            return res.status(200).send({
                status: true,
                code: 200,
                message: messages.rating.success
            });
        }
        return res.status(400).send({
            status: false,
            code: 400,
            message: messages.rating.invalidOrder
        });

    }
    catch (error) {
        next(error);
    }
}
const getratingbyrentalOffice = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        const rentalOfficeId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        // 🔢 get total count of ratings
        const totalCount = await review.countDocuments({
            targetId: rentalOfficeId,
            targetType: 'rentalOffice'
        });
        const ratings = await review.find({ targetId: rentalOfficeId, targetType: 'rentalOffice' })
            .populate('userId')
            .select('rating comment createdAt')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
            console.log(ratings)
        if (!ratings || ratings.length === 0) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.rentalOffice.ratingNotFound
            });
        }

        const customizedRatings = ratings.map(rating => {
            const user = rating.userId.toObject();
            return {
                username: user.username,
                image: user.image,
                rating: rating.rating,
                comment: rating.comment ?? " ",
                createdAt: rating.createdAt
            };
        }
        );
        console.log(customizedRatings)
        //customizedRatings,
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en" ? "Your request has been completed successfully" : "تمت معالجة الطلب بنجاح",
            data: {
                rating: customizedRatings,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                }
            }
        });
    } catch (error) {
        next(error);
    }
}
const getRatingByUser = async (req, res, next) => {

    try {
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const ratings = await review.find({ userId })
            .populate('userId', 'username image')
            .select('rating comment createdAt')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        if (!ratings || ratings.length === 0) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.rating.ratingUser
            });
        }
        const totalCount = await review.countDocuments({
            userId: userId
        });
        const customizedRatings = ratings.map(rating => {
            const user = rating.userId.toObject();
            return {
                username: user.username,
                image: user.image,
                rating: rating.rating,
                comment: rating.comment || " ",
                createdAt: rating.createdAt
            };
        });
        /*customizedRatings*/
        return res.status(200).send({
            status: true,
            code: 200,
            data: {
                rating: customizedRatings,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                }
            },
        });
    }
    catch (error) {
        next(error);
    }



}
const getRatingByServiceProvider= async (req,res,next)=>{
    try {
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        const rentalOfficeId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        // 🔢 get total count of ratings
        const totalCount = await review.countDocuments({
            targetId: rentalOfficeId,
            targetType: 'rentalOffice'
        });
        const ratings = await review.find({ targetId: rentalOfficeId, targetType: 'serviceProvider' })
            .populate('userId')
            .select('rating comment createdAt')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
            console.log(ratings)
        if (!ratings || ratings.length === 0) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.rentalOffice.ratingNotFound
            });
        }

        const customizedRatings = ratings.map(rating => {
            const user = rating.userId.toObject();
            return {
                username: user.username,
                image: user.image,
                rating: rating.rating,
                comment: rating.comment ?? " ",
                createdAt: rating.createdAt
            };
        }
        );
        console.log(customizedRatings)
        //customizedRatings,
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en" ? "Your request has been completed successfully" : "تمت معالجة الطلب بنجاح",
            data: {
                rating: customizedRatings,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                }
            }
        });
    } catch (error) {
        next(error);
    }
}
module.exports = {
    addRatingForOrder,
    getratingbyrentalOffice,
    getRatingByUser,
    getRatingByServiceProvider
}