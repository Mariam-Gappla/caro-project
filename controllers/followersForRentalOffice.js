const follower = require("../models/followersForRentalOffice");
const rentalOffice = require("../models/rentalOffice");
const getMessages = require("../configration/getmessages");
const { sendNotification } = require("../configration/firebase.js");
const { followerSchemaValidation } = require("../validation/followersForRentalOfficeValidition")
const addFollower = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const rentalOfficeId = req.params.rentalOfficeId;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang)
        const { error } = followerSchemaValidation(lang).validate({
            userId,
            rentalOfficeId
        })
        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message
            });
        }
        console.log(rentalOfficeId);
        const existRentalOffice = await rentalOffice.findById({ _id: rentalOfficeId });
        if (!existRentalOffice) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang == "en" ? "rental Office does not exist" : "هذا المكتب غير موجود"
            });
        }
        if (!userId || !rentalOfficeId) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang == "en" ? "userId and rentalOfficeId is required" : "معرف المستخدم ومعرف المكتب مطلوبين"
            });
        }
        const followers = await follower.create({ userId, rentalOfficeId });
        await sendNotification({
            target: existRentalOffice,
            targetType: "rentalOffice",
            titleAr: "متابع جديد",
            titleEn: "New Follower",
            messageAr: `${user.username} بدأ بمتابعتك`,
            messageEn: `${user.username} started following you`,
            actionType: "follow",
        });
        res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en"
                ? "rentalOffice followed successfully"
                : "تمت متابعة المكتب بنجاح"
        });
    }
    catch (err) {
        if (err.code === 11000) {
            const lang = req.headers['accept-language'] || 'en';
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang == "en"
                    ? "you followed this rentalOffice" : "انت تتابع هذا المكتب بالفعل"
            });
        }
        next(err)
    }
}
const getFollowersForRentalOffice = async (req, res, next) => {
    try {
        const rentalOfficeId = req.user.id;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);

        if (!rentalOfficeId) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.rentalOffice.rentalOfficeId
            });
        }

        // 📌 pagination params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 📌 get total count
        const totalCount = await follower.countDocuments({ rentalOfficeId });

        // 📌 get followers with pagination
        const followers = await follower
            .find({ rentalOfficeId })
            .skip(skip)
            .limit(limit)
            .populate("userId", "username image");

        if (!followers || followers.length === 0) {
            return res.status(200).send({
                status: true,
                code: 200,
                message: messages.follower.noFollowers,
                data: {
                    followers: followers,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(totalCount / limit),
                    }
                }
            });
        }

        // 📌 format response
        const modifiedFollowers = followers.map(f => ({
            image: f.userId?.image,
            username: f.userId?.username
        }));

        res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en" ? "Your request has been completed successfully" : "تمت معالجة الطلب بنجاح",
            data: {
                followers: modifiedFollowers,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                }
            }
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    addFollower,
    getFollowersForRentalOffice,
}