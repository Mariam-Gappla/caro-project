const addProviderRating = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const providerId=req.user.id;
        const role=req.user.role;
        if(role !== 'serviceProvider') {
            return res.status(400).send({
                code:400,
                status: false,
                message:lang=="en"? 'Only service providers can add ratings': 'فقط مقدمي الخدمة يمكنهم إضافة تقييمات',
            });
        }


    }
    catch (error) {
        next(error)
    }
}
module.exports = {
    addProviderRating
}