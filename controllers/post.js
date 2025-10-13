const Post = require("../models/post");
const postSchema = require("../validation/postValidition");
const Comment = require("../models/centerComments");
const Reply = require("../models/centerReplies");
const saveImage = require("../configration/saveImage");
const Tweet = require("../models/tweets");
const MainCategory = require("../models/mainCategoryActivity");
const MainCategoryCenter = require("../models/mainCategoryCenter");
const Comments = require("../models/comments");
const ReplyOnComments = require("../models/replyOnComments");
const Counter = require("../controllers/counter");
const centerFollower = require("../models/followerCenter");
const ShowRoomPost = require("../models/showroomPost");
const favorite = require("../models/favorite");
const Reel = require("../models/reels");
const Search=require("../models/searchForAnyThing");
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


    // 🟢 1. هات البوستات من كل الجداول
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

    // 🟢 2. IDs لكل نوع
    const postIds = posts.map((p) => p._id);
    const showroomIds = showroomPosts.map((p) => p._id);
    const searchIds = searchPosts.map((p) => p._id);
    const tweetIds = tweets.map((t) => t._id);

    // 🟢 3. هات الكومنتات والردود
    const [comments, replies, tweetComments, tweetReplies] = await Promise.all([
      // comments/replies للـ Posts + Showroom + Search
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
      // 🟢 tweet comments
      Comments.aggregate([
        { $match: { tweetId: { $in: tweetIds } } },
        { $group: { _id: "$tweetId", count: { $sum: 1 } } },
      ]),
      // 🟢 tweet replies
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

    // 🟢 4. جهّزي Maps للعدّ
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

    // 🟢 5. صياغة النتائج لكل نوع
    const formatData = (items, type) =>
      items.map((post) => {
        const idKey = `${type}_${post._id}`;
        const commentCount = commentMap[idKey] || 0;
        const replyCount = replyMap[idKey] || 0;

        return {
          id: post._id,
          type,
          title: post.title,
          price: post.price,
          images: post.images || [],
          createdAt: post.createdAt,
          city: post.cityId?.name?.[lang] || "",
          totalCommentsAndReplies: commentCount + replyCount,
          userData: {
            id: type == "Post" ? post.userId._id : post.showroomId._id,
            username: type == "Post" ? post.userId.username : post.showroomId.username,
            image: type == "Post" ? post.userId.image : post.showroomId.image,
            status: type == "Post" ? post.userId.status : post.showroomId.status,
          }

        };
      });

    const formattedTweets = tweets.map((tweet) => {
      const commentCount = tweetCommentMap[tweet._id.toString()] || 0;
      const replyCount = tweetReplyMap[tweet._id.toString()] || 0;

      return {
        id: tweet._id,
        type: "Tweet",
        title: tweet.title,
        content: tweet.content || "",
        images: tweet.images || [],
        createdAt: tweet.createdAt,
        totalCommentsAndReplies: commentCount + replyCount,
        userData: {
          id: tweet.userId._id,
          username: tweet.userId.username,
          image: tweet.userId.image,
          status: tweet.userId.status,

        }

      };
    });

    // 🟢 6. دمج الكل
    const allPosts = [
      ...formatData(posts, "Post"),
      ...formatData(showroomPosts, "ShowRoomPost"),
      ...formatData(searchPosts, "Search"),
      ...formattedTweets,
    ];

    // 🟢 7. ترتيبهم بالتاريخ وpagination
    const sorted = allPosts.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const paginated = sorted.slice(skip, skip + limit);

    // 🟢 8. الرد النهائي
    res.status(200).send({
      status: true,
      code: 200,
      data: {
        posts: paginated,
        pagination: {
          page: page,
          totalPages: Math.ceil(allPosts.length / limit),
        }
      }

    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  addPost,
  getPostsByMainCategory,
  getPostById,
  getrelevantPosts,
  makeSearchByTitle,
  getProfilePosts
}
