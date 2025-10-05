const Search = require("../models/searchForAnyThing");
const searchValidationSchema = require("../validation/searchValidition");
const Comment=require("../models/centerComments");
const Reply=require("../models/centerReplies");
const Reel=require("../models/reels");
const saveImage = require("../configration/saveImage");
const addPost = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
    const userId = req.user.id
    const images = req.files.images;
    if (!images || images.length === 0) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en" ? "Images are required" : "الصور مطلوبة"
      });
    }
     if (req.body.contactMethods) {
      if (!Array.isArray(req.body.contactMethods)) {
        req.body.contactMethods = [req.body.contactMethods];
      }
    }
    const { error } = searchValidationSchema(lang).validate({ ...req.body });
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

    const search=await Search.create({
      ...req.body,
      userId: userId,
      images: imagePaths,
    });
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en" ? "Post added successfully and pending review by the administration" : "تم اضافه المنشور بنجاح وبأنتظار المراجعه من الاداره"
    });


  }
  catch (err) {
    next(err)
  }
}
const getPosts = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    // pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // ✅ نجيب البوستات فقط من Post
    const posts = await Search.find({})
      .populate({
        path: "userId",
        select: "username image status phone categoryCenterId",
        populate: {
          path: "categoryCenterId",
          select: `name.${lang}`, // علشان يجيب الاسم باللغه
        },
      })
      .populate("cityId", 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();


    const totalCount = await Search.countDocuments();

    // ✅ نحسب التعليقات والردود
    const postIds = posts.map(p => p._id);
    console.log("postIds:", postIds);
    const [comments, replies] = await Promise.all([
      // 🟢 1) التعليقات
      Comment.aggregate([
        { $match: { entityId: { $in: postIds }, entityType: "Search" } },
        { $group: { _id: "$entityId", count: { $sum: 1 } } }
      ]),

      // 🟢 2) الردود
      Reply.aggregate([
        {
          $lookup: {
            from: "centercomments",    // مش Comment, اسم الكولكشن جوه MongoDB
            localField: "commentId",   // اللي في Reply
            foreignField: "_id",       // اللي في CenterComment
            as: "commentData"
          }
        },
        { $unwind: "$commentData" },

        {
          $match: { "commentData.entityId": { $in: postIds } }
        },

        {
          $group: {
            _id: "$commentData.entityId",
            count: { $sum: 1 }
          }
        }
      ])
    ]);


    console.log("replies:", replies);
    const commentMap = {};
    comments.forEach(c => {
      commentMap[c._id.toString()] = c.count;
    });
    console.log("commentMap:", commentMap);
    const replyMap = {};
    replies.forEach(r => {
      replyMap[r._id.toString()] = r.count;
    });

    // ✅ format
    const formattedPosts = posts.map(post => {
      const commentCount = commentMap[post._id.toString()] || 0;
      const replyCount = replyMap[post._id.toString()] || 0;
      return {
        id: post._id,
        createdAt: post.createdAt,
        images: post.images || [],
        title: post.title,
        price: post.price,
        city: post.cityId?.name?.[lang] || "",
        totalCommentsAndReplies: commentCount + replyCount,
        userData: {
          id:post.userId._id,
          username: post.userId.username,
          image: post.userId.image,
          status: post.userId.status,
          isShowRoom: post.userId?.categoryCenterId?.name?.en == "showrooms" ? true : false, // ✅ أهو هنا
        }
      };
    });


    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    res.status(200).send({
      status: true,
      code: 200,
      message:
        lang === "en"
          ? "Posts retrieved successfully"
          : "تم استرجاع المنشورات بنجاح",
      data: {
        posts: formattedPosts,
        pagination: {
          page,
          totalPages
        }
      }
    });
  } catch (err) {
    next(err);
  }
}
const getPostById = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
    const postId = req.params.id;

    const post = await Search.findOne({ _id: postId });
    if (!post) {
      return res.status(404).send({
        status: false,
        code: 404,
        message: lang === "en" ? "Post not found" : "المنشور غير موجود",
      });
    }

    const mapContactType = {
      Call: 1,
      WhatsApp: 2,
      Chat: 3,
    };

    let contactTypes = [];
    if (post.contactMethods) {
      const types = Array.isArray(post.contactMethods)
        ? post.contactMethods
        : post.contactMethods.split(",");

      contactTypes = types
        .map((t) => mapContactType[t.trim()])
        .filter((v) => v !== undefined);
    }

    let contactValue = null;
    if (
      contactTypes.includes(mapContactType.Call) &&
      contactTypes.includes(mapContactType.whatsapp)
    ) {
      // ✅ لو Call + WhatsApp مع بعض
      contactValue = post.phoneNumber;
    } else if (contactTypes.includes(mapContactType.Call)) {
      // ✅ لو Call فقط
      contactValue = post.phoneNumber;
    } else if (contactTypes.includes(mapContactType.whatsapp)) {
      // ✅ لو WhatsApp فقط
      contactValue = post.phoneNumber;
    } else if (contactTypes.includes(mapContactType.Chat)) {
      // ✅ لو Chat فقط
      contactValue = null;
    }

    const formatedPost = {
      title: post.title,
      details: post.details,
      images: post.images,
      contactMethods: contactTypes,
      contactValue: contactValue,
    };

    return res.status(200).send({
      status: true,
      code: 200,
      message:
        lang === "en"
          ? "Post retrieved successfully"
          : "تم استرجاع المنشور بنجاح",
      data: formatedPost,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addPost,
  getPosts,
  getPostById
}