const SlavagePost = require("../models/slavgePost");
const { saveImage } = require("../configration/saveImage");
const salvagePostSchema = require("../validation/postSlavgeValidition");
const addPost = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const userId = req.user.id;
        const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
        console.log(req.body);
        const { lat, long } = req.body;

        if (!lat || !long) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang == "ar" ? "الموقع (lat, long) مطلوب" : "Location (lat, long) is required"
            });
        }

        // ✅ جهز location object
        req.body.location = {
            type: "Point",
            coordinates: [parseFloat(long), parseFloat(lat)] // [longitude, latitude]
        };

        // ❌ امسح الـ lat,long علشان مش محتاجينهم في الموديل
        delete req.body.lat;
        delete req.body.long;
        const images = req.files.images;
        if (!images || images.length === 0) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === "en" ? "Images are required" : "الصور مطلوبة"
            });
        }
        const { error } = salvagePostSchema(lang).validate({ ...req.body });
        if (error) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: error.details[0].message
            });
        }

        let imagePaths = [];
        images.forEach(file => {
            const imagePath = saveImage(file);
            imagePaths.push(`${BASE_URL}${imagePath}`);
        });
        await SlavagePost.create({
            ...req.body,
            userId: userId,
            images: imagePaths,
        });
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en" ? "Post added successfully" : "تم إضافة المنشور بنجاح"
        });

    }
    catch (err) {
        next(err)
    }
}
const endPost = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const userId = req.user.id;
        const post=await SlavagePost.findOne({ _id: req.params.id, userId: userId });
        if (!post) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang == "en" ? "post not found" : "المنشور غير موجود"
            })
        }
        const postId = req.params.id;
       await SlavagePost.findOneAndUpdate({ _id: postId}, {ended: true });
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en" ? "order ended succesfully" : "تم انهاء الاوردر بنجاح"
        })
    }
    catch (error) {
        next(error)
    }
}
module.exports = {
    addPost,
    endPost
}