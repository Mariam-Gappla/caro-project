const { followerCenterSchema } = require("../validation/followerCenter");
const User = require("../models/user");
const follower = require("../models/followersForRentalOffice");
const mongoose = require("mongoose");
const CenterFollower = require("../models/followerCenter");
const {sendNotification}=require("../configration/firebase.js");
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
    const center = await User.findOne({ _id: centerId }).populate("categoryCenterId");
    const user = await User.findOne({ _id: userId }).populate("categoryCenterId");
    console.log(`center:${center}`);
    console.log(`user:${user}`);
    if (
      center.isProvider === true &&
      user.isProvider === true &&
      (
        user.categoryCenterId.name[lang] !== "Auto Salvage" &&
        center.categoryCenterId.name[lang] !== "Auto Salvage"
      )
    ) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang == "ar"
          ? "المركز لا يستطيع متابعة مركز آخر"
          : "Center cannot follow another center"
      });
    }

    // ✅ check if already followed
    const existCenter = await CenterFollower.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      centerId: new mongoose.Types.ObjectId(centerId)
    });

    if (existCenter) {
      await CenterFollower.findOneAndDelete({
        userId: new mongoose.Types.ObjectId(userId),
        centerId: new mongoose.Types.ObjectId(centerId)
      })
      return res.status(200).send({
        status: true,
        code: 200,
        message: lang == "en" ? "follow canceled successfuly" : "تم الغاء المتابعه"
      });
    }
    else {
      // ✅ create new follow
      await CenterFollower.create({
        userId: new mongoose.Types.ObjectId(userId),
        centerId: new mongoose.Types.ObjectId(centerId)
      });
      await sendNotification({
        target: center,
        targetType: "User",
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
          ? "Center followed successfully"
          : "تمت متابعة المركز بنجاح"
      });

    }
  }
  catch (err) {
    next(err);
  }

}
const getAllFollowersForUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const lang = req.headers["accept-language"] || "en";
    if (!userId) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en"
          ? "User ID is required"
          : "معرّف المستخدم مطلوب",
      });
    }

    // 📌 pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 📌 get following (المكاتب + المعارض)
    const [rentalFollowing, centerFollowing] = await Promise.all([
      // المكاتب اللي بيتابعها
      follower.find({ userId })
        .populate("rentalOfficeId", "username image")
        .lean(),

      // المعارض اللي بيتابعها
      CenterFollower.find({ userId })
        .populate({
          path: "centerId",
          select: "username image categoryCenterId",
          populate: {
            path: "categoryCenterId",
            select: "name",
          }
        })
        .lean(),
    ]);
    console.log(centerFollowing)
    // 📌 merge results
    let allFollowing = [
      ...rentalFollowing.map(f => ({
        title: f.rentalOfficeId?.username,
        image: f.rentalOfficeId?.image,
        subTitle: lang === "en" ? "Rental Office" : "مكتب تأجير",
        followedAt: f.followedAt,
      })),
      ...centerFollowing.map(f => ({
        title: f.centerId?.username,
        image: f.centerId?.image,
        subTitle: f.centerId?.categoryCenterId?.name?.[lang] || (lang == "en" ? "user" : "مستخدم"),
        followedAt: f.followedAt,
      })),
    ];

    // 📌 sort by followedAt (الأحدث الأول)
    allFollowing = allFollowing.sort((a, b) => b.followedAt - a.followedAt);

    // 📌 pagination
    const totalCount = allFollowing.length;
    const paginatedFollowing = allFollowing.slice(skip, skip + limit);

    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en"
        ? "Following retrieved successfully"
        : "تم جلب المتابَعين بنجاح",
      data: {
        following: paginatedFollowing,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  addFollowerCenter,
  getAllFollowersForUser
}