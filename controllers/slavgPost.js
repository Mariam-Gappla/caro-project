const SlavagePost = require("../models/slavgePost");
const { saveImage } = require("../configration/saveImage");
const mongoose = require("mongoose");
const User = require("../models/user");
const salvagePostSchema = require("../validation/postSlavgeValidition");
const addPost = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const userId = req.user.id;
        const user = await User.findOne({ _id: userId })
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
        const post = await SlavagePost.create({
            ...req.body,
            userId: userId,
            images: imagePaths,
        });
        io.emit("slavgeOrder", {
            id: post._id,
            type: "slavePost",
            title: post.title,
            image: post.images[0],
            locationText: post.locationText,
            details: post.details,
            createdAt: post.createdAt,
        })
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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const lang = req.headers['accept-language'] || 'en';
        const { providerId } = req.body;
        const userId = req.user.id;

        if (!providerId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === "en" ? "providerId is required" : "معرف المزود مطلوب"
            });
        }

        const post = await SlavagePost.findOne({ _id: req.params.id, userId: userId }).session(session);
        if (!post) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === "en" ? "post not found" : "المنشور غير موجود"
            });
        }

        const updatedPost = await SlavagePost.findOneAndUpdate(
            { _id: req.params.id },
            { ended: true, providerId: providerId },
            { new: true, session }
        );

        const user = await User.findOne({ _id: providerId }).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang === "en" ? "provider not found" : "المزود غير موجود"
            });
        }

        // كل العمليات نجحت، نعمل commit
        await session.commitTransaction();
        session.endSession();

        io.emit("slavgeOrder", {
            id: updatedPost._id,
            type: "slavePost",
            title: updatedPost.title,
            image: updatedPost.images[0],
            locationText: updatedPost.locationText,
            details: updatedPost.details,
            createdAt: updatedPost.createdAt,
            providerData: {
                username: user.username,
                image: user.image
            }
        });

        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en" ? "order ended successfully" : "تم انهاء الاوردر بنجاح"
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};
const getPosts = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const status = req.query.status;
        const providerId = req.user.id;

        // 🟢 pagination params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 🟢 build filter
        let filterSlavage = { providerId };
        if (status === "inProgress") {
            filterSlavage.ended = false;
        } else if (status === "ended") {
            filterSlavage.ended = true;
        }

        // 🟢 count total documents for pagination
        const totalCount = await SlavagePost.countDocuments(filterSlavage);

        // 🟢 get paginated posts
        const slavePosts = await SlavagePost.find(filterSlavage)
            .populate("userId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // 🟢 format posts
        const slavePostsFormatted = slavePosts.map((post) => ({
            id: post._id,
            type: "slavePost",
            title: post.title,
            image: post.images?.[0],
            locationText: post.locationText,
            details: post.details,
            createdAt: post.createdAt,
            userData: post.userId
                ? {
                    username: post.userId.username,
                    image: post.userId.image,
                }
                : undefined,
        }));

        // 🟢 return response
        return res.status(200).send({
            status: true,
            code: 200,
            message:
                lang === "ar"
                    ? "تم استرجاع جميع الطلبات بنجاح"
                    : "All orders retrieved successfully",
            data: {
                orders: slavePostsFormatted,
                pagination: {
                    page,
                    limit,
                    totalPages: Math.ceil(totalCount / limit),
                    totalItems: totalCount,
                },
            },
        });
    } catch (err) {
        next(err);
    }
};
const getPostById = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const postId = req.params.id;
        const slavePosts = await SlavagePost.findById(postId)
            .populate("providerId")
            .sort({ createdAt: -1 })
            .lean();

        // 🟢 return response
        return res.status(200).send({
            status: true,
            code: 200,
            message:
                lang === "ar"
                    ? "تم استرجاع جميع الطلبات بنجاح"
                    : "All orders retrieved successfully",
            data: {
                id: slavePosts._id,
                title: slavePosts.title,
                image: slavePosts.images?.[0],
                locationText: slavePosts.locationText,
                location: {
                    lat: slavePosts.location.coordinates[1],
                    long: slavePosts.location.coordinates[0]
                },
                details: slavePosts.details,
                createdAt: slavePosts.createdAt,
                userData: slavePosts.providerId
                    ? {
                        username: slavePosts.providerId.username,
                        image: slavePosts.providerId.image,
                    }
                    : undefined,
            },


        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    addPost,
    endPost,
    getPosts,
    getPostById
}