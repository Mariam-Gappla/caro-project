const Tweet = require("../models/tweets");
const { tweetValidationSchema } = require("../validation/tweetvalidition");
const Comment = require("../models/comments.js");
const getMessages = require("../configration/getmessages.js");
const Replies = require("../models/replyOnComments.js");
const path = require("path");
const mongoose = require("mongoose")
const fs = require("fs");
const {saveImage} = require("../configration/saveImage.js");
const addTweet = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const id = req.user.id;
    const messages = getMessages(lang);

    const data = {
      userId: id,
      ...req.body
    };
    // تحقق من البيانات النصية
    const { error } = tweetValidationSchema(lang).validate(data);
    if (error) {
      return res.status(400).send({
        code: 400,
        status: false,
        message: error.details[0].message
      });
    }

    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/';
    const { content, title } = req.body;
    let imageUrl;
    // ⬅️ التعامل مع الصور
    if (req.files?.image) {
      const image = Array.isArray(req.files.image) ? req.files.image : [req.files.image];

      if (image.length > 1) {
        return res.status(400).send({
          code: 400,
          status: false,
          message: lang === 'en'
            ? "You can upload up to 1 image only"
            : "مسموح بحد أقصى صوره واحدة فقط"
        });
      }
      const file = req.files.image
      imageUrl = BASE_URL + saveImage(file[0])


    }

    // ⬅️ الحفظ في قاعدة البيانات
    const tweet = await Tweet.create({
      content,
      title,
      userId: id,
      image: imageUrl,
    });

    return res.status(200).send({
      code: 200,
      status: true,
      message: messages.tweet.addTweet
    });

  } catch (err) {
    next(err);
  }
};
const addLike = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tweetId = req.params.id;
    console.log(tweetId);
    const lang = req.headers['accept-language'] || 'en';
    const messages = getMessages(lang);
    const tweet = await Tweet.findOne({ _id: tweetId });
    if (!tweet) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: messages.tweet.existTweet
      });
    }
    const alreadyLiked = tweet.likedBy.includes(userId);
    let updatedTweet;
    if (alreadyLiked) {
      // Remove the like
      updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $pull: { likedBy: userId } },
        { new: true }
      );
    } else {
      // Add the like
      updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $addToSet: { likedBy: userId } }, // $addToSet prevents duplicates
        { new: true }
      );
    }
    return res.status(200).json({
      status: true,
      code: 200,
      message: alreadyLiked ? messages.tweet.removeLike : messages.tweet.addLike,
    });
  }
  catch (err) {
    next(err);
  }
}
const tweetsWithFullCommentCount = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user.id; // string

    const totalTweets = await Tweet.countDocuments();

    const result = await Tweet.aggregate([
      // 🟢 Get comments
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "tweetId",
          as: "comments",
        },
      },
      // 🟢 Get replies
      {
        $lookup: {
          from: "replyoncomments",
          localField: "comments._id",
          foreignField: "commentId",
          as: "replies",
        },
      },
      // 🟢 Convert tweet.userId to ObjectId to fetch user info
      {
        $addFields: {
          userId: { $toObjectId: "$userId" },
        },
      },
      // 🟢 Fetch user data
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 🟢 Check if current user liked this tweet
      {
        $addFields: {
          isLiked: {
            $in: [
              { $toObjectId: userId }, // 👈 هنا نحول userId فقط
              { $ifNull: ["$likedBy", []] },
            ],
          },
        },
      },

      // 🟢 Project output
      {
        $project: {
          title: 1,
          content: 1,
          images: 1,
          video: 1,
          createdAt: 1,
          totalComments: {
            $add: [
              { $ifNull: [{ $size: "$comments" }, 0] },
              { $ifNull: [{ $size: "$replies" }, 0] },
            ],
          },
          likesCount: {
            $cond: {
              if: { $isArray: "$likedBy" },
              then: { $size: "$likedBy" },
              else: 0,
            },
          },
          userData: {
            username: "$user.username",
            image: "$user.image",
          },
          isLiked: 1, // ✅ include it in final output
        },
      },

      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalPages = Math.ceil(totalTweets / limit);

    res.status(200).send({
      code: 200,
      status: true,
      message:
        lang === "en"
          ? "Tweets fetched successfully"
          : "تم جلب التغريدات بنجاح",
      data: {
        tweets: result,
        pagination: {
          page,
          totalPages,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
const getTweetById = async (req, res, next) => {
  try {
    const tweetId = req.params.id;
    const lang = req.headers['accept-language'] || 'en';
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
      return res.status(400).send({
        code: 400,
        status: false,
        message: lang === "en" ? "Tweet ID is not valid" : "معرف التويت غير صحيح",
      });
    }

    const result = await Tweet.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(tweetId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likedBy", []] } },
          isLiked: {
            $in: [
              { $toObjectId: userId },
              { $ifNull: ["$likedBy", []] }
            ]
          },
        },
      },
      {
        $project: {
          _id: 0,
          tweet: {
            _id: "$_id",
            title: "$title",
            content: "$content",
            images: "$images",
            video: "$video",
            createdAt: "$createdAt",
            userData: {
              username: "$userData.username",
              image: "$userData.image",
            },
            likesCount: "$likesCount",
            isLiked: "$isLiked",
          },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return res.status(404).send({
        status: false,
        code: 404,
        message: lang === "en" ? "Tweet not found" : "التويته غير موجوده",
      });
    }

    return res.status(200).send({
      code: 200,
      status: true,
      message:
        lang === "en"
          ? "Tweet fetched successfully"
          : "تم جلب التويته بنجاح",
      data: result[0].tweet,
    });
  } catch (err) {
    next(err);
  }
};
const getCommentsAndRepliesForTweet = async (req, res, next) => {
  try {
    const tweetId = req.params.id;
    const lang = req.headers["accept-language"] || "en";

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
      return res.status(400).send({
        code: 400,
        status: false,
        message:
          lang === "en"
            ? "Tweet ID is not valid"
            : "معرف التويت غير صحيح",
      });
    }

    const result = await Comment.aggregate([
      { $match: { tweetId: new mongoose.Types.ObjectId(tweetId) } },

      // 🔹 بيانات المستخدم صاحب الكومنت
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },

      // 🔹 الردود على الكومنت
      {
        $lookup: {
          from: "replyoncomments",
          localField: "_id",
          foreignField: "commentId",
          as: "replies",
        },
      },

      // 🔹 بيانات المستخدمين اللي عاملين الردود
      {
        $lookup: {
          from: "users",
          localField: "replies.userId",
          foreignField: "_id",
          as: "replyUsers",
        },
      },

      // 🔹 دمج بيانات المستخدم داخل الرد
      {
        $addFields: {
          replies: {
            $map: {
              input: { $ifNull: ["$replies", []] },
              as: "reply",
              in: {
                id: "$$reply._id", // ✅ تحويل _id إلى id
                content: "$$reply.content",
                createdAt: "$$reply.date", // ✅ عرض createdAt للرد
                userData: {
                  $let: {
                    vars: {
                      user: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$replyUsers",
                              as: "ru",
                              cond: { $eq: ["$$ru._id", "$$reply.userId"] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: {
                      username: "$$user.username",
                      image: "$$user.image",
                    },
                  },
                },
              },
            },
          },
          repliesCount: { $size: { $ifNull: ["$replies", []] } },
        },
      },

      // 🔹 الحقول النهائية
      {
        $project: {
          _id: 0, // ✅ نخفي _id
          id: "$_id", // ✅ نظهره كـ id فقط
          content: 1,
          createdAt: 1,
          userData: {
            username: "$userData.username",
            image: "$userData.image",
          },
          replies: 1,
          repliesCount: 1,
        },
      },
    ]);

    const totalCommentsCount = result.length;
    const totalRepliesCount = result.reduce(
      (sum, c) => sum + (c.repliesCount || 0),
      0
    );

    return res.status(200).send({
      code: 200,
      status: true,
      message:
        lang === "en"
          ? "Comments and replies fetched successfully"
          : "تم جلب التعليقات والردود بنجاح",
      data: {
        comments: result,
        totalCommentsCount,
        totalCommentsAndRepliesCount:
          totalCommentsCount + totalRepliesCount,
      },
    });
  } catch (err) {
    next(err);
  }
};












module.exports = {
  addTweet,
  addLike,
  tweetsWithFullCommentCount,
 getTweetById,
  getCommentsAndRepliesForTweet
}