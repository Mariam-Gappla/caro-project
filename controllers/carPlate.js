const CarPlatePost = require("../models/carPlate");
const carPlatePostSchema = require("../validation/carPlateValidition");
const getNextOrderNumber = require("../controllers/counter");
const addCarPlatePost = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const userId = req.user.id;
        const { error } = carPlatePostSchema(lang).validate(req.body);
        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message
            });
        }
        const counter = await getNextOrderNumber("carPlate");
        req.body.postNumber = counter.seq;
        await CarPlatePost.create(...req.body, userId);
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en" ? "carPlate added successfully" : "تمت إضافة اللوحة بنجاح"
        });
    }
    catch (error) {
        next(error);
    }

}
const getCarPlatesPosts = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 🟢 تجهيز الفلترة
        const filteration = {};
        if (req.query.isFixedPrice !== undefined) {
            filteration.isFixedPrice = req.query.isFixedPrice === "true";
        }

        // 🟢 هات البيانات
        const carPlates = await CarPlatePost.find(filteration)
            .populate("cityId")
            .populate("userId")
            .skip(skip)
            .limit(limit)
            .lean();

        // 🟢 حساب إجمالي الصفحات
        const totalDocs = await CarPlatePost.countDocuments(filteration);
        const totalPages = Math.ceil(totalDocs / limit);

        // 🟢 تجهيز الشكل النهائي
        const formatedCarPlates = carPlates.map((carPlate) => ({
            plateNumber: carPlate.plateNumber,
            plateLetters: carPlate.plateLetters,
            isFixedPrice: carPlate.isFixedPrice,
            userData: {
                userName: carPlate.userId?.name,
                image: carPlate.userId?.image
            },
            cityName: carPlate.cityId?.name?.[lang] || "",
        }));

        return res.status(200).send({
            status: true,
            code: 200,
            data: {
                posts: formatedCarPlates,
                pagination: {
                    page,
                    totalPages,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};
const getCarPlatesPostById = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const postId = req.params.id;
        const carPlate = await CarPlatePost.findById(postId)
            .populate("cityId")
            .populate("userId")
            .lean();
        const formatedCarPlate = {
            ...carPlate,
            priceAfterAuction:undefined,
            userData: {
                userName: carPlate.userId?.name,
                image: carPlate.userId?.image
            },
            cityName: carPlate.cityId?.name?.[lang],
        };
        return res.status(200).send({
            status: true,
            code: 200,
            data: formatedCarPlate,
        });
    }
    catch (error) {
        next(error);
    }
};


module.exports = { addCarPlatePost, getCarPlatesPosts,getCarPlatesPostById }