const rentalOffice = require("../models/rentalOffice");
const getAllRentallOffice = async (req, res, next) => {
    try {
        const allRentalOffice = await rentalOffice.find();
        return res.status(200).send({
            status: 200,
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

        const existRentalOffice = await rentalOffice.findOne({ _id: rentalOfficeId });
        if (!existRentalOffice) {
            return res.status(404).json({ message: "لم يتم العثور على مكتب التأجير" });
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
            message: alreadyLiked ? "تم الغاء الاعجاب بمكتب التأجير" : "تم الاعجاب بمكتب التأجير",
            likesCount: updatedRentalOffice.likedBy.length
        });
    }
    catch (err) {
        next(err);
    }
}
module.exports = {
    getAllRentallOffice,
    addLike
}