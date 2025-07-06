const follower = require("../models/followersForRentalOffice");
const rentalOffice = require("../models/rentalOffice");
const getMessages = require("../configration/getmessages");
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
                message: messages.rentalOffice.existRentalOffice
            });
        }
        if (!userId || !rentalOfficeId) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.required.userIdAndRentalId
            });
        }
        const followers = await follower.create({ userId, rentalOfficeId });
        res.status(200).send({
            status: true,
            code: 200,
            message: messages.follower.success,
        });
    }
    catch (err) {
        if (err.code === 11000) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.follower.exist
            });
        }
        next(err)
    }
}
const getFollowersForRentalOffice = async (req, res, next) => {
    try {
        const rentalOfficeId = req.user.id;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang)
        if (!rentalOfficeId) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.rentalOffice.rentalOfficeId
            });
        }
        const followers = await follower.find({ rentalOfficeId }).populate("userId", "username image");
        if (!followers || followers.length === 0) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.follower.noFollowers
            });
        }
       const modifiedFollowers = followers.map(f => ({
            ...f.toObject(),
            userId:undefined,
            rentalOfficeId: undefined,
            _id: undefined,
            followedAt:undefined,
            __v:undefined,
            image: f.userId?.image,
            username: f.userId?.username
        }));
        res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en" ? "Your request has been completed successfully" : "تمت معالجة الطلب بنجاح",
            data: modifiedFollowers
        });
    } catch (err) {
        next(err);
    }
}
module.exports = {
    addFollower,
    getFollowersForRentalOffice
}