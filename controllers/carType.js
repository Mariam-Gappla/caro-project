const carType = require("../models/carType")
const addType = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const { type } = req.body;
        await carType.create({
            carName: type
        });
        return res.send({
            status: true,
            code: 200,
            message: lang == "ar" ? "تم اضافه نوع السياره بنجاح" : "car type added successfully"
        })


    }
    catch (error) {
        next(error)
    }
}
const getTypes = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalCount = await carType.countDocuments();
        const rawTypes = await carType.find().skip(skip).limit(limit);

        // تغيير شكل النتائج
        const types = rawTypes.map((n) => ({
            id: n._id,
            text: n.carType, // لو اسم الحقل مختلف غيره هنا
        }));

        return res.send({
            status: true,
            code: 200,
            message:
                lang === "en"
                    ? "Your request has been completed successfully"
                    : "تمت معالجة الطلب بنجاح",
            data: {
                content: names,
                pagination: {
                    page: page,
                    totalPages: Math.ceil(totalCount / limit),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};
module.exports = {
    addType,
    getTypes
}