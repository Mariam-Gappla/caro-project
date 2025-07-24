const providerRatingSchema= require("../validation/providerRating");
const ProviderRating = require("../models/providerRating");
const addProviderRating = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const  serviceProviderId=req.user.id;
        const role=req.user.role;
        if(role !== 'serviceProvider') {
            return res.status(400).send({
                code:400,
                status: false,
                message:lang=="en"? 'Only service providers can add ratings': 'فقط مقدمي الخدمة يمكنهم إضافة تقييمات',
            });
        }
        const {userId, rating, comment, orderId } = req.body;
        const { error } = providerRatingSchema(lang).validate({
            serviceProviderId,
            userId,
            rating,
            comment,
            orderId
        });
        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message
            });
        }
        const existingRating = await ProviderRating.findOne({
            serviceProviderId,
            userId,
            orderId
        });
        if (existingRating) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: lang === 'en' ? 'You have already rated this service provider for this order' : 'لقد قمت بتقييم هذا المزود للخدمة بالفعل لهذا الطلب'
            });
        }
        await ProviderRating.create({
            serviceProviderId,
            userId,
            rating,
            comment,
            orderId
        });
        return res.status(200).send({
            code: 200,
            status: true,
            message: lang === 'en' ? 'Rating added successfully' : 'تم إضافة التقييم بنجاح'
        });


    }
    catch (error) {
        next(error)
    }
}
module.exports = {
    addProviderRating
}