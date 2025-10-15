const Post = require("../models/post");
const postSchema = require("../validation/postValidition");
const Comment = require("../models/centerComments");
const Reply = require("../models/centerReplies");
const { saveImage, deleteImage } = require("../configration/saveImage");
const Tweet = require("../models/tweets");
const MainCategory = require("../models/mainCategoryActivity");
const MainCategoryCenter = require("../models/mainCategoryCenter");
const Comments = require("../models/comments");
const ReplyOnComments = require("../models/replyOnComments");
const RatingCenter = require("../models/ratingCenter");
const Counter = require("../controllers/counter");
const centerFollower = require("../models/followerCenter");
const ShowRoomPost = require("../models/showroomPost");
const favorite = require("../models/favorite");
const User = require("../models/user");
const Service = require("../models/centerServices");
const Reel = require("../models/reels");
const Search = require("../models/searchForAnyThing");
const mongoose = require("mongoose");
const Favorite = require("../models/favorite");
const addPost = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
    const userId = req.user.id
    const images = req.files.images;
    const video = req.files.video;

    if (!images || images.length === 0) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en" ? "Images are required" : "الصور مطلوبة"
      });
    }

    if (video && video.length > 1) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en"
          ? "Only one video is allowed"
          : "مسموح برفع فيديو واحد فقط"
      });
    }
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


    if (req.body.contactType) {
      if (!Array.isArray(req.body.contactType)) {
        req.body.contactType = [req.body.contactType];
      }
    }

    const { error } = postSchema(lang).validate({ ...req.body, userId });
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

    let videoPath;
    if (video && video.length === 1) {
      videoPath = `${BASE_URL}${saveImage(video[0])}`;
    }

    const post = await Post.create({
      ...req.body,
      userId: userId,
      images: imagePaths,
      video: videoPath || undefined
    });
    if (videoPath) {
      await Reel.create({
        video: post.video,
        discription: post.description,
        createdBy: post.userId
      });
    }

    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en" ? "Post added successfully" : "تم إضافة المنشور بنجاح"
    });
  } catch (err) {
    next(err);
  }
};
const getPostsByMainCategory = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const categoryId = req.params.categoryId;

    // 🟢 pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 🟢 location params
    const longitude = parseFloat(req.query.long);
    const latitude = parseFloat(req.query.lat);
    const radiusKm = 5; // ثابت = 5 كم

    // 🟢 الفلتر الأساسي
    let matchFilter = { mainCategoryId: new mongoose.Types.ObjectId(categoryId) };

    // city filter
    if (req.query.cityId) {
      matchFilter.cityId = req.query.cityId;
    }

    // search filter
    if (req.query.search) {
      matchFilter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
      ];
    }

    let posts = [];
    let totalCount = 0;

    // ✅ لو فيه location يبقى نفلتر بالأقرب
    if (!isNaN(longitude) && !isNaN(latitude)) {
      posts = await Post.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [longitude, latitude] },
            distanceField: "distanceInKm",
            distanceMultiplier: 0.001, // متر -> كم
            maxDistance: radiusKm * 1000, // 5 كم
            spherical: true,
            query: matchFilter, // باقي الفلاتر
          },
        },
        { $sort: { distanceInKm: 1 } },
        { $skip: skip },
        { $limit: limit },
      ]);

      totalCount = posts.length;
    } else {
      // ✅ من غير location
      posts = await Post.find(matchFilter)
        .populate({
          path: "userId",
          select: "username image status phone categoryCenterId",
          populate: {
            path: "categoryCenterId",
            select: `name.${lang}`,
          },
        })
        .populate("cityId", `name.${lang}`)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      totalCount = await Post.countDocuments(matchFilter);
    }

    // 🟢 نجيب التعليقات والردود
    const postIds = posts.map((p) => p._id);
    const [comments, replies] = await Promise.all([
      Comment.aggregate([
        { $match: { entityId: { $in: postIds }, entityType: "Post" } },
        { $group: { _id: "$entityId", count: { $sum: 1 } } },
      ]),
      Reply.aggregate([
        {
          $lookup: {
            from: "centercomments",
            localField: "commentId",
            foreignField: "_id",
            as: "commentData",
          },
        },
        { $unwind: "$commentData" },
        { $match: { "commentData.entityId": { $in: postIds } } },
        { $group: { _id: "$commentData.entityId", count: { $sum: 1 } } },
      ]),
    ]);

    // 🟢 map counts
    const commentMap = {};
    comments.forEach((c) => {
      commentMap[c._id.toString()] = c.count;
    });
    const replyMap = {};
    replies.forEach((r) => {
      replyMap[r._id.toString()] = r.count;
    });

    // 🟢 format output
    const formattedPosts = posts.map((post) => {
      const commentCount = commentMap[post._id?.toString()] || 0;
      const replyCount = replyMap[post._id?.toString()] || 0;

      return {
        id: post._id,
        createdAt: post.createdAt,
        images: post.images || [],
        title: post.title,
        price: post.price,
        city: post.cityId?.name?.[lang] || "",
        distanceInKm: post.distanceInKm
          ? Number(post.distanceInKm.toFixed(2))
          : null, // يظهر لو geoNear اشتغل
        totalCommentsAndReplies: commentCount + replyCount,
        userData: post.userId
          ? {
            id: post.userId._id,
            username: post.userId.username,
            image: post.userId.image,
            status: post.userId.status,
            isShowRoom:
              post.userId?.categoryCenterId?.name?.en == "showrooms"
                ? true
                : false,
          }
          : null,
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
        pagination: { page, totalPages },
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
    const userId = req.user.id;
    let post = await Post.findById(postId)
      .populate("userId", "username image")
      .lean();
    if (!post) {
      return res.status(404).send({
        status: false,
        code: 404,
        message:
          lang === "en" ? "Post not found" : "المنشور غير موجود",
      });
    }
    const isFollower = await centerFollower.findOne({ userId: userId, centerId: post.userId._id });
    const isFavorite = await Favorite.findOne({ entityType: "Post", entityId: postId, userId: userId });
    // 🟢 contactType mapping
    const mapContactType = {
      call: 1,
      whatsapp: 2,
      inAppChat: 3,
    };

    let contactTypes = [];
    if (post.contactType) {
      const types = Array.isArray(post.contactType)
        ? post.contactType
        : post.contactType.split(",");

      contactTypes = types
        .map((t) => mapContactType[t.trim()])
        .filter((v) => v !== undefined);
    }

    // 🟢 priceType mapping
    const mapPriceType = {
      best: 1,        // أفضل سعر
      negotiable: 2,  // قابل للتفاوض
      fixed: 3        // ثابت
    };

    const priceTypeCode = mapPriceType[post.priceType] || null;
    const price =
      post.priceType === "negotiable" || post.priceType === "fixed"
        ? post.price
        : undefined;

    const formatedPost = {
      id: post._id,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      video: post.video || null,
      images: post.images || null,
      title: post.title,
      description: post.description,
      isFavorite: isFavorite ? true : false,
      isFollower: isFollower ? true : false,
      contactTypes: contactTypes,
      contactValue: post.contactValue,
      priceType: priceTypeCode, // 🟢 هنا الرقم بدل النص
      price: price,             // 🟢 يرجع السعر لو best أو fixed فقط
      userData: {
        id: post.userId?._id,
        username: post.userId?.username,
        image: post.userId?.image
      },
    };

    return res.status(200).send({
      status: true,
      code: 200,
      message:
        lang === "en"
          ? "Post retrieved successfully"
          : "تم استرجاع المنشور بنجاح",
      data: formatedPost
    });
  } catch (error) {
    next(error);
  }
};
const getrelevantPosts = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const postId = req.params.id;

    let post = await Post.findById(postId)
      .populate("userId", "username image")
      .lean();

    const relevantPosts = await Post.find({ subCategoryId: post.subCategoryId, _id: { $ne: postId } });
    const formatedRelevantPosts = relevantPosts.map((post) => {
      return {
        id: post._id,
        image: post.images[0]
      }
    });
    return res.status(200).send({
      status: true,
      code: 200,
      message:
        lang === "en"
          ? "Post retrieved successfully"
          : "تم استرجاع المنشور بنجاح",
      data: formatedRelevantPosts
    })

  }
  catch (err) {
    next(err)
  }

}
const makeSearchByTitle = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const matchFilter = {};
    if (req.query.search) {
      matchFilter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
      ];
    }
    const posts = await Post.find(matchFilter)
      .populate({
        path: "userId",
        select: "username image status phone categoryCenterId",
        populate: {
          path: "categoryCenterId",
          select: `name.${lang}`,
        },
      })
      .populate("cityId", `name.${lang}`)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await Post.countDocuments(matchFilter);
    const postIds = posts.map((p) => p._id);
    const [comments, replies] = await Promise.all([
      Comment.aggregate([
        { $match: { entityId: { $in: postIds }, entityType: "Post" } },
        { $group: { _id: "$entityId", count: { $sum: 1 } } },
      ]),
      Reply.aggregate([
        {
          $lookup: {
            from: "centercomments",
            localField: "commentId",
            foreignField: "_id",
            as: "commentData",
          },
        },
        { $unwind: "$commentData" },
        { $match: { "commentData.entityId": { $in: postIds } } },
        { $group: { _id: "$commentData.entityId", count: { $sum: 1 } } },
      ]),
    ]);

    // 🟢 map counts
    const commentMap = {};
    comments.forEach((c) => {
      commentMap[c._id.toString()] = c.count;
    });
    const replyMap = {};
    replies.forEach((r) => {
      replyMap[r._id.toString()] = r.count;
    });

    // 🟢 format output
    const formattedPosts = posts.map((post) => {
      const commentCount = commentMap[post._id?.toString()] || 0;
      const replyCount = replyMap[post._id?.toString()] || 0;

      return {
        id: post._id,
        createdAt: post.createdAt,
        images: post.images || [],
        title: post.title,
        price: post.price,
        city: post.cityId?.name?.[lang] || "",
        totalCommentsAndReplies: commentCount + replyCount,
        userData: post.userId
          ? {
            id: post.userId._id,
            username: post.userId.username,
            image: post.userId.image,
            status: post.userId.status,
            isShowRoom:
              post.userId?.categoryCenterId?.name?.en == "showrooms"
                ? true
                : false,
          }
          : null,
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
        pagination: { page, totalPages },
      },
    });

  }
  catch (err) {
    next(err)
  }
}
const getProfilePosts = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const userId = req.user.id;

    // 🟢 pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const haveService = await Service.findOne({ centerId: userId });
    const user = await User.findOne({ _id: userId }).populate("cityId").populate("subCategoryCenterId").lean();
    console.log(user);
    // 🟢 جلب البيانات من كل الجداول
    const [posts, showroomPosts, searchPosts, tweets] = await Promise.all([
      Post.find({ userId })
        .populate({
          path: "userId",
          select: "username image status phone categoryCenterId",
        })
        .populate("cityId", `name.${lang}`)
        .lean(),

      ShowRoomPost.find({ showroomId: userId })
        .populate({
          path: "showroomId",
          select: "username image status phone categoryCenterId",
        })
        .populate("cityId", `name.${lang}`)
        .lean(),

      Search.find({ userId })
        .populate({
          path: "userId",
          select: "username image status phone categoryCenterId",
        })
        .populate("cityId", `name.${lang}`)
        .lean(),

      Tweet.find({ userId })
        .populate({
          path: "userId",
          select: "username image status phone categoryCenterId",
        })
        .lean(),
    ]);

    // 🟢 IDs
    const postIds = posts.map((p) => p._id);
    const showroomIds = showroomPosts.map((p) => p._id);
    const searchIds = searchPosts.map((p) => p._id);
    const tweetIds = tweets.map((t) => t._id);

    // 🟢 comments + replies
    const [comments, replies, tweetComments, tweetReplies] = await Promise.all([
      Comment.aggregate([
        { $match: { entityId: { $in: [...postIds, ...showroomIds, ...searchIds] } } },
        { $group: { _id: { entityId: "$entityId", entityType: "$entityType" }, count: { $sum: 1 } } },
      ]),
      Reply.aggregate([
        {
          $lookup: {
            from: "centercomments",
            localField: "commentId",
            foreignField: "_id",
            as: "commentData",
          },
        },
        { $unwind: "$commentData" },
        { $match: { "commentData.entityId": { $in: [...postIds, ...showroomIds, ...searchIds] } } },
        {
          $group: {
            _id: {
              entityId: "$commentData.entityId",
              entityType: "$commentData.entityType",
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Comments.aggregate([
        { $match: { tweetId: { $in: tweetIds } } },
        { $group: { _id: "$tweetId", count: { $sum: 1 } } },
      ]),
      ReplyOnComments.aggregate([
        {
          $lookup: {
            from: "comments",
            localField: "commentId",
            foreignField: "_id",
            as: "commentData",
          },
        },
        { $unwind: "$commentData" },
        { $match: { "commentData.tweetId": { $in: tweetIds } } },
        { $group: { _id: "$commentData.tweetId", count: { $sum: 1 } } },
      ]),
    ]);

    // 🟢 maps
    const commentMap = {};
    comments.forEach((c) => {
      commentMap[`${c._id.entityType}_${c._id.entityId}`] = c.count;
    });

    const replyMap = {};
    replies.forEach((r) => {
      replyMap[`${r._id.entityType}_${r._id.entityId}`] = r.count;
    });

    const tweetCommentMap = {};
    tweetComments.forEach((c) => {
      tweetCommentMap[c._id.toString()] = c.count;
    });

    const tweetReplyMap = {};
    tweetReplies.forEach((r) => {
      tweetReplyMap[r._id.toString()] = r.count;
    });

    // 🟢 formatter
    const formatData = (items, type) =>
      items.map((post) => {
        const idKey = `${type}_${post._id}`;
        const commentCount = commentMap[idKey] || 0;
        const replyCount = replyMap[idKey] || 0;

        const user =
          type === "Post"
            ? post.userId
            : type === "ShowRoomPost"
              ? post.showroomId
              : post.userId;

        return {
          id: post._id,
          type,
          title: post.title,
          price: post.price,
          images: post.images || [],
          createdAt: post.createdAt,
          city: post.cityId?.name?.[lang] || "",
          totalCommentsAndReplies: commentCount + replyCount,
          userData: user
            ? {
              id: user._id,
              username: user.username,
              image: user.image,
              status: user.status,
            }
            : null,
        };
      });

    // 🟢 tweets
    const formattedTweets = tweets.map((tweet) => {
      const commentCount = tweetCommentMap[tweet._id.toString()] || 0;
      const replyCount = tweetReplyMap[tweet._id.toString()] || 0;

      const user = tweet.userId;

      return {
        id: tweet._id,
        type: "Tweet",
        title: tweet.title,
        content: tweet.content || "",
        images: tweet.images ? [tweet.images] : [],
        createdAt: tweet.createdAt,
        totalCommentsAndReplies: commentCount + replyCount,
        userData: user
          ? {
            id: user._id,
            username: user.username,
            image: user.image,
            status: user.status,
          }
          : null,
      };
    });

    // 🟢 combine & paginate
    const allPosts = [
      ...formatData(posts, "Post"),
      ...formatData(showroomPosts, "ShowRoomPost"),
      ...formatData(searchPosts, "Search"),
      ...formattedTweets,
    ];
    // 🟢 لو عنده خدمة، نجيب المتوسط من RatingCenter
    let serviceData = null;
    if (haveService) {
      let ratings;
      ratings = await RatingCenter.find({ centerId: user._id });
      const allRatings = ratings.map(r => r.rating);
      const avgRating =
        allRatings.length > 0
          ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
          : 0;


      serviceData = {
        username: user.username,
        createdAt:user.createdAt,
        details: user.details || "",
        subCategoryCenter: user.subCategoryCenterId?.name?.[lang] || "",
        city: user.cityId?.name?.[lang] || "",
        averageRate: avgRating.toFixed(1),
      };
    }

    const sorted = allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const paginated = sorted.slice(skip, skip + limit);

    res.status(200).send({
      status: true,
      code: 200,
      data: {
        service: serviceData || null,
        posts: paginated,
        pagination: {
          page,
          totalPages: Math.ceil(allPosts.length / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
const deleteProfilePost = async (req, res, next) => {
  try {
    const { type, id } = req.body;
    const userId = req.user.id;
    console.log(userId)
    const lang = req.headers["accept-language"] || "en";
    if (!type || !id) {
      return res.status(400).json({ success: false, message: "Type and ID are required" });
    }

    // 🟢 تحديد الموديل حسب النوع
    let Model;
    switch (type) {
      case "Post":
        Model = Post;
        break;
      case "ShowRoomPost":
        Model = ShowRoomPost;
        break;
      case "Search":
        Model = Search;
        break;
      case "Service":
        Model = Service;
        break;
      case "Tweet":
        Model = Tweet;
        break;
      default:
        return res.status(400).send({
          status: false,
          code: 400,
          message: "Invalid type provided"
        });
    }

    // 🟢 التأكد إن البوست تابع للمستخدم
    let query = {}
    if (type === "Service") {
      query = { _id: id, centerId: userId }
    }
    else if (type === "ShowRoomPost") {
      query = { _id: id, showroomId: userId };
    }
    else {
      query = { _id: id, userId: userId };
    }
    const post = await Model.findOne(query);
    /*const post = await Model.findOne(query);*/
    if (!post) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "ar"
          ? "المنشور غير موجود أو ليس لديك صلاحية لحذفه"
          : "Post not found or not authorized to delete"
      });
    }
    if (type === "Service") {
      // الصور داخل products
      if (post.products && Array.isArray(post.products)) {
        for (const p of post.products) {
          if (p.image) deleteImage(p.image);
        }
      }
    } else if (type === "Tweet") {
      // Tweet عنده صورة واحدة فقط
      if (post.image) {
        deleteImage(post.image);
      }
    } else {
      // باقي الأنواع عندها images array
      if (post.images && Array.isArray(post.images)) {
        for (const img of post.images) {
          deleteImage(img);
        }
      }
    }

    // 🟢 حذف البوست نفسه
    await Model.deleteOne({ _id: id });

    // 🟢 حذف التعليقات والردود المرتبطة
    if (type === "Tweet") {
      // تعليقات وردود tweet
      const comments = await Comments.find({ tweetId: id });
      const commentIds = comments.map((c) => c._id);

      await Comments.deleteMany({ tweetId: id });
      await ReplyOnComments.deleteMany({ commentId: { $in: commentIds } });
    } else {
      // باقي الأنواع (CenterComments و Reply)
      const entityType = type === "Service" ? "User" : type;

      const comments = await Comment.find({ entityId: id, entityType });
      const commentIds = comments.map((c) => c._id);

      await Comment.deleteMany({ entityId: id, entityType });
      await Reply.deleteMany({ commentId: { $in: commentIds } });
    }

    // ✅ الرد النهائي
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "ar"
        ? `${type} تم حذفه بنجاح مع الصور والتعليقات والردود المرتبطة.`
        : `${type} deleted successfully along with local images, comments, and replies.`
    });
  } catch (err) {
    next(err);
  }
};
const updateEntityByType = async (req, res, next) => {
  try {
    const { type, id } = req.query;
    const lang = req.headers["accept-language"] || "en";
    const userId = req.user.id;
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

    let Model;
    switch (type) {
      case "Post":
        Model = Post;
        break;
      case "ShowRoomPost":
        Model = ShowRoomPost;
        break;
      case "Service":
        Model = Service;
        break;
      case "Tweet":
        Model = Tweet;
        break;
      case "Search":
        Model = Search;
        break;
      default:
        return res.status(400).send({
          success: false,
          message:
            lang === "ar"
              ? "النوع المحدد غير صالح."
              : "Invalid entity type provided.",
        });
    }

    const existingDoc = await Model.findById(id);
    if (!existingDoc) {
      return res.status(404).json({
        success: false,
        message:
          lang === "ar" ? "العنصر غير موجود." : "Entity not found.",
      });
    }

    // ✅ تحديد المالك حسب نوع الـ entity
    let ownerId;
    if (type === "Service") {
      ownerId = existingDoc.centerId?.toString();
    } else if (type === "ShowRoomPost") {
      ownerId = existingDoc.showroomId?.toString();
    } else {
      ownerId = existingDoc.userId?.toString();
    }

    // تحقق من الملكية
    if (ownerId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message:
          lang === "ar"
            ? "غير مصرح لك بتعديل هذا العنصر."
            : "You are not authorized to update this entity.",
      });
    }

    // ✅ معالجة الصور
    let newImages = [];

    if (req.files && req.files.length > 0) {
      // حذف الصور القديمة فقط لو فيه صور جديدة
      if (type === "Service") {
        if (existingDoc.products?.length) {
          existingDoc.products.forEach((p) => {
            if (p.image) {
              const imgPath = path.join("/var/www", p.image);
              if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            }
          });
        }
      } else {
        const images = type === "Tweet" ? [existingDoc.images] : existingDoc.images || [];
        images.forEach((imgPath) => {
          const fullPath = path.join("/var/www", imgPath);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        });
      }

      // حفظ الصور الجديدة
      newImages = req.files.map((file) => BASE_URL + saveImage(file));
    }

    // ✅ تحديث البيانات
    const updatedData = { ...req.body };

    if (req.files && req.files.length > 0) {
      if (type === "Service") {
        updatedData.products = req.files.map((file) => BASE_URL + saveImage(file));
      } else if (type === "Tweet") {
        updatedData.images = newImages[0]; // لأنها مش Array
      } else {
        updatedData.images = newImages;
      }
    } else {
      // لو مفيش صور جديدة نخلي القديمة
      if (type === "Service") updatedData.products = existingDoc.products;
      else if (type === "Tweet") updatedData.images = existingDoc.images;
      else updatedData.images = existingDoc.images;
    }

    await Model.findByIdAndUpdate(id, updatedData, { new: true });

    return res.status(200).send({
      status: true,
      code: 200,
      message:
        lang === "ar"
          ? `${type} تم تعديله بنجاح.`
          : `${type} updated successfully.`,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
const updateCreatedAt = async (req, res, next) => {
  try {
    console.log("updated");
    const { id, type } = req.body;
    const userId = req.user.id;

    if (!id || !type) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: "id and type are required",
      });
    }

    let Model;
    let ownerField;

    switch (type) {
      case "Post":
        Model = Post;
        ownerField = "userId";
        break;
      case "ShowRoomPost":
        Model = ShowRoomPost;
        ownerField = "showroomId";
        break;
      case "Search":
        Model = Search;
        ownerField = "userId";
        break;
      case "Tweet":
        Model = Tweet;
        ownerField = "userId";
        break;
      case "Service":
        Model = User;
        break;
      default:
        return res.status(400).json({
          status: false,
          code: 400,
          message: "Invalid type",
        });
    }

    // ✅ Service update
    if (type === "Service") {
      if (id !== userId.toString()) {
        return res.status(403).send({
          status: false,
          code: 403,
          message: "You are not authorized to update this service",
        });
      }

      await User.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { createdAt: new Date() } }
      );

      return res.status(200).send({
        status: true,
        code: 200,
        message: "Service updated successfully",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "Invalid ID format",
      });
    }

    const entity = await Model.findById(id);
    if (!entity) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: "Entity not found",
      });
    }

    if (entity[ownerField].toString() !== userId.toString()) {
      return res.status(403).json({
        status: false,
        code: 403,
        message: "You are not authorized to update this entity",
      });
    }

    // ✅ تحديث التاريخ فعليًا (بـ MongoDB مباشرة)
    await Model.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { createdAt: new Date() } }
    );

    return res.status(200).send({
      status: true,
      code: 200,
      message: `${type} updated successfully`,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};









module.exports = {
  addPost,
  getPostsByMainCategory,
  getPostById,
  getrelevantPosts,
  makeSearchByTitle,
  getProfilePosts,
  deleteProfilePost,
  updateEntityByType,
  updateCreatedAt
}
