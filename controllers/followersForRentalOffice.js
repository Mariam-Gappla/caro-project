const follower = require("../models/followersForRentalOffice");
const rentalOffice=require("../models/rentalOffice");
const addFollower = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const rentalOfficeId = req.params.id;
        console.log(rentalOfficeId);
        const existRentalOffice = await rentalOffice.findById({ _id: rentalOfficeId });
        if (!existRentalOffice) {
            return res.status(400).send({
                status: 400,
                message: "لم يتم العثور على هذا المكتب"
            });
        }
        if (!userId || !rentalOfficeId) {
            return res.status(400).json({ message: 'معرف المستخدم ومعرف المكتب مطلوبين' });
        }
        const followers= await follower.create({userId,rentalOfficeId});
        res.status(200).json({ message: 'Followed successfully', followers });
    }
    catch (err) {
        if (err.code === 11000) {
      return res.status(409).json({ message: 'المستخدم متابع هذا المكتب بالفعل' });
    }
        next(err)
    }
}
module.exports={
    addFollower
}