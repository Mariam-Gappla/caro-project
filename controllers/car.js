const Car = require("../models/car");
const carPostSchema = require("../validation/carValidition");
const saveImage = require("../configration/saveImage");
const addCarPost = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/';
        req.body.createdAt = new Date();
        const userId = req.user.id;
        if (req.body.auctionStart) {
            req.body.auctionStart = new Date(req.body.auctionStart);
        }
        if (req.body.auctionEnd) {
            req.body.auctionEnd = new Date(req.body.auctionEnd);
        }

        const { error } = carPostSchema(lang).validate(req.body);
        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message
            });
        }
        if (!req.files || !req.files.images || req.files.images.length === 0) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: lang === "en" ? "Images are required" : "الصور مطلوبه"
            });
        }

        // تحقق من الفيديو: لازم يكون <= 1
        if (req.files.video && req.files.video.length > 1) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang == "en"
                    ? "You must upload only one video"
                    : "مسموح برفع فيديو واحد فقط"
            });
        }
        const images = req.files.images || [];
        const videoFile = req.files.video ? req.files.video[0] : null;

        const imagesUrl = images.map((img) => BASE_URL + saveImage(img));
        const videoUrl = videoFile ? BASE_URL + saveImage(videoFile) : null;

        await Car.create({ ...req.body, userId, images: imagesUrl, videoCar: videoUrl });
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en" ? "car post added successfully" : "تمت إضافة اعلان السياره بنجاح"
        });


    }
    catch (err) {
        next(err)
    }
}
const getCarPosts = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";

        // pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let filteration = {};
        if (req.query.cityId) {
            filteration.cityId = req.query.cityId
        }
        const totalCars = await Car.countDocuments(filteration);
        const cars = await Car.find(filteration)
            .populate("nameId")
            .populate("modelId")
            .populate("carTypeId")
            .populate("cityId")
            .populate("userId")
            .populate("carConditionId")
            .skip(skip)
            .limit(limit);

        const formatedCars = cars.map((car) => {
            // عنوان حسب حالة العربية
            let title = lang === "ar"
                ? car.carNew ? "عربية جديدة" : "عربية مستعملة"
                : car.carNew ? "New Car" : "Used Car";

            // الأيام المتبقية لو السعر مش ثابت
            let remainingDays = null;
            if (!car.isFixedPrice && car.auctionEnd) {
                const now = new Date();
                const endDate = new Date(car.auctionEnd);
                const diffTime = endDate - now;
                remainingDays = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
            }
            console.log(remainingDays)
            return {
                id: car._id,
                images: car.images,
                odometer: car.odeoMeter,
                price: car.carPrice, // خلي بالك الحقل carPrice مش price
                city: car.cityId?.name?.[lang] || "",
                title,
                name: car.nameId?.carName?.[lang] || "",
                model: car.modelId?.model?.[lang] || "",
                carType: car.carTypeId?.type?.[lang] || "",
                carCondition: car.carConditionId.name[lang],
                isFixedPrice: car.isFixedPrice,
                remainingDays,
            };
        });

        res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en"
                ? "Your request has been completed successfully"
                : "تمت معالجة الطلب بنجاح",
            data: {
                cars: formatedCars,
                pagination: {
                    page,
                    totalPages: Math.ceil(totalCars / limit),
                },
            }

        });
    } catch (err) {
        next(err);
    }
};
const getCarPostById = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const postId = req.params.id;
        const car = await Car.findOne({ _id: postId }).populate("cityId").populate("userId").populate("carConditionId") .populate("nameId")
            .populate("modelId")
            .populate("carTypeId");
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en"
                ? "Your request has been completed successfully"
                : "تمت معالجة الطلب بنجاح",
            data: {
                images: car.images,
                odometer: car.odeoMeter,
                price: car.price,
                city: car.cityId.name[lang],
                carCondition:car.carConditionId.name[lang],
                auctionStart: car.isFixedPrice == false ? car.auctionStart : undefined,
                auctionEnd: car.isFixedPrice == false ? car.auctionEnd : undefined,
                 name: car.nameId?.carName?.[lang] || "",
                model: car.modelId?.model?.[lang] || "",
                carType: car.carTypeId?.type?.[lang] || "",
                notes: car.notes,
                phoneNumber: car.phoneNumber,
                userdata: {
                    username: car.userId.username,
                    image: car.userId.image
                }
            }
        })
    }
    catch (err) {
        next(err)
    }
}

module.exports = {
    addCarPost,
    getCarPosts,
    getCarPostById
}