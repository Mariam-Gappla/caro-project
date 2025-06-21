const rentalOffice = require("../models/rentalOffice");
const getMessages = require("../configration/getmessages")
const followersForRentalOffice = require("../models/followersForRentalOffice");
const ratingForOrder = require("../models/ratingForOrder");
const carRental = require("../models/carRental");
const getAllRentallOffice = async (req, res, next) => {
    try {
        const allRentalOffice = await rentalOffice.find();
        return res.status(200).send({
            code: 200,
            status: true,
            data: allRentalOffice
        });

    }
    catch (err) {
        next(err)
    }
}
const addLike = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const rentalOfficeId = req.params.id;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        const existRentalOffice = await rentalOffice.findOne({ _id: rentalOfficeId });
        if (!existRentalOffice) {
            return res.status(400).send({
                status: 400,
                code: false,
                message: messages.rentalOffice.existRentalOffice
            });
        }
        const alreadyLiked = existRentalOffice.likedBy.includes(userId);
        let updatedRentalOffice;
        if (alreadyLiked) {
            // Remove the like
            updatedRentalOffice = await rentalOffice.findByIdAndUpdate(
                rentalOfficeId,
                { $pull: { likedBy: userId } },
                { new: true }
            );
        } else {
            // Add the like
            updatedRentalOffice = await rentalOffice.findByIdAndUpdate(
                rentalOfficeId,
                { $addToSet: { likedBy: userId } }, // $addToSet prevents duplicates
                { new: true }
            );
        }
        return res.status(200).json({
            status: true,
            code: 200,
            message: alreadyLiked ? messages.rentalOffice.removeLike : messages.rentalOffice.addLike,
            likesCount: updatedRentalOffice.likedBy.length
        });
    }
    catch (err) {
        next(err);
    }
}
const getRentalOfficeProfile = async (req, res, next) => {
    const lang = req.headers['accept-language'] || 'en';
    const messages = getMessages(lang);
    try {
        const rentalOfficeId = req.user.id;
        const rentalType=req.query.rentalType;
        let cars=[];
        if(!rentalType)
        {
            cars= await carRental.find({rentalOfficeId:rentalOfficeId});
        }
        else
        {
            cars= await carRental.find({rentalOfficeId:rentalOfficeId,rentalType:rentalType});
        }
        console.log("rentalOfficeId", rentalOfficeId);
        const existRentalOffice = await rentalOffice.findOne({ _id: rentalOfficeId });
        if (!existRentalOffice) {
            return res.status(400).send({
                status: 400,
                code: false,
                message: messages.rentalOffice.existRentalOffice
            });
        }
        const likes = existRentalOffice.likedBy.length;
        const followersCount = await followersForRentalOffice.countDocuments({ rentalOfficeId: existRentalOffice._id });
        const result = await ratingForOrder.aggregate([
            {
                $match: {
                    targetId: existRentalOffice._id,
                    targetType: 'rentalOffice'
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" }
                }
            }
        ]);
        const averageRating = result.length > 0 ? result[0].averageRating.toFixed(1) : 0;
       

        return res.status(200).send({
            status: true,
            code: 200,
            username: existRentalOffice.username,
            image: existRentalOffice.image,
            rating: averageRating,
            likes:likes,
            followers: followersCount,
            cars: cars,
        });

    }
    catch (err) {
        next(err);
    }
}
module.exports = {
    getAllRentallOffice,
    addLike,
    getRentalOfficeProfile
}