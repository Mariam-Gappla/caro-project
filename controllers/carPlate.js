const CarPlatePost = require("../models/carPlate");
const carPlatePostSchema = require("../validation/carPlateValidition");
const getNextOrderNumber = require("../controllers/counter");
const Favorite = require("../models/favorite");
const addCarPlatePost = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const userId = req.user.id;
        const platen = req.body.plateLettersEn;
        const platar = req.body.plateLettersAr;
        req.body.createdAt = new Date();
        if (!platen || !platen) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: lang == "en" ? "plateLetters must be english and arabic" : "حروف اللوحه يجب ان تكون بالعربى والانجليزى"
            })
        }
        req.body.plateLetters = {
            en: platen,
            ar: platar
        }
        delete req.body['plateLettersEn'];
        delete req.body['plateLettersAr'];
        const { error } = carPlatePostSchema(lang).validate(req.body);
        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message
            });
        }
        const counter = await getNextOrderNumber("carPlate");
        req.body.postNumber = counter;
        console.log(req.body)
        await CarPlatePost.create({ ...req.body, userId });
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
        if (req.query.isFixedPrice !== undefined && req.query.digites !== undefined) {
            filteration.isFixedPrice = req.query.isFixedPrice === "true";
            filteration.digites = Number(req.query.digites)
        }
        if (req.query.cityId) {
            filteration.cityId = req.query.cityId;
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
        const formatedCarPlates = await Promise.all(
            carPlates.map(async (carPlate) => {
                const favorite = await Favorite.findOne({
                    entityId: carPlate._id,
                    entityType: "CarPlate"
                });

                return {
                    id: carPlate._id,
                    plateNumber: carPlate.plateNumber,
                    plateLetters: carPlate.plateLetters,
                    isFixedPrice: carPlate.isFixedPrice,
                    userData: {
                        id:carPlate.userId._id,
                        username: carPlate.userId?.username,
                        image: carPlate.userId?.image,
                    },
                    price: carPlate.price,
                    plateType: carPlate.plateType === "commercial" ? 2 : 1,
                    cityName: carPlate.cityId?.name?.[lang] || "",
                    isFavorite: !!favorite
                };
            })
        );


        return res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en"
                ? "Your request has been completed successfully"
                : "تمت معالجة الطلب بنجاح",
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
        let formatedCarPlate = {}
        if (carPlate.isFixedPrice == true) {
            formatedCarPlate = {
                phone: carPlate.phoneNumber,
                price: carPlate.price,
                plateLetters: carPlate.plateLetters,
                plateNumber:carPlate.plateNumber,
                priceAfterAuction: undefined,
                plateType: carPlate.plateType === "commercial" ? 2 : 1,
                createdAt:carPlate.createdAt,
                notes:carPlate.notes || "",
                userData: {
                    id:carPlate.userId._id,
                    username: carPlate.userId?.username,
                    image: carPlate.userId?.image
                },
                cityName: carPlate.cityId?.name?.[lang],
            };

        }
        else {
            formatedCarPlate = {
                phone: carPlate.phoneNumber,
                price: carPlate.price,
                plateLetters: carPlate.plateLetters,
                plateNumber:carPlate.plateNumber,
                auctionStart: carPlate.auctionStart,
                auctionEnd: carPlate.auctionEnd,
                priceAfterAuction: undefined,
                plateType: carPlate.plateType === "commercial" ? 2 : 1,
                createdAt:carPlate.createdAt,
                notes:carPlate.notes || "",
                userData: {
                    id:carPlate.userId._id,
                    username: carPlate.userId?.username,
                    image: carPlate.userId?.image
                },
                cityName: carPlate.cityId?.name?.[lang],
            };

        }

        return res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en"
                ? "Your request has been completed successfully"
                : "تمت معالجة الطلب بنجاح",
            data: formatedCarPlate,
        });
    }
    catch (error) {
        next(error);
    }
};


module.exports = { addCarPlatePost, getCarPlatesPosts, getCarPlatesPostById }