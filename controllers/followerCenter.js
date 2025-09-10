const {followerCenterSchema}=require("../validation/followerCenter");
const User=require("../models/user");
const CenterFollower=require("../models/followerCenter")
const mongoose=require("mongoose");
const addFollowerCenter = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const centerId = req.body.centerId;
    const lang = req.headers['accept-language'] || 'en';

    const { error } = followerCenterSchema(lang).validate(req.body);
    if (error) {
      return res.status(400).send({
        code: 400,
        status: false,
        message: error.details[0].message
      });
    }

    // ✅ check if already followed
    const existCenter = await CenterFollower.findOne({ 
      userId: new mongoose.Types.ObjectId(userId), 
      centerId: new mongoose.Types.ObjectId(centerId) 
    });

    if (existCenter) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang=="en" 
          ? "Center is already followed" 
          : "انت تتابع هذا المركز بالفعل"
      });
    }

    // ✅ create new follow
    await CenterFollower.create({ 
      userId: new mongoose.Types.ObjectId(userId), 
      centerId: new mongoose.Types.ObjectId(centerId) 
    });

    res.status(200).send({
      status: true,
      code: 200,
      message: lang=="en" 
        ? "Center followed successfully" 
        : "تمت متابعة المركز بنجاح"
    });
  }
  catch (err) {
    next(err);
  }
}

module.exports={
   addFollowerCenter
}