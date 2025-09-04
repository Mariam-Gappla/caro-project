const {followerCenterSchema}=require("../validation/followerCenter");
const User=require("../models/user");
const addFollowerCenter = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const centerId = req.params.id;
        const lang = req.headers['accept-language'] || 'en';
        const { error } = followerCenterSchema(lang).validate({
           ...req.body
        })
        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message
            });
        }
        const existCenter = await User.findById({ _id: centerId });
        if (!existCenter) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: lang=="en"? "center is followed already":"انت تتابع هذا المركز بالفعل"
            });
        }
        await User.create({ userId, centerId });
        res.status(200).send({
            status: true,
            code: 200,
            message: lang=="en" ? "rating added sucsesfully" : "تم اضافه التقييم بنجاح"
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
module.exports={
   addFollowerCenter
}