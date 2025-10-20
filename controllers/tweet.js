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
const getTweetWithCommentsAndReplies = async (req, res, next) => {
  try {
    const tweetId = req.params.id;
    const lang = req.headers['accept-language'] || 'en';
    const messages = getMessages(lang);
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
      return res.status(400).send({
        code: 400,
        status: false,
        message: lang === "en" ? "Tweet ID is not valid" : "معرف التويت غير صحيح",
      });
    }

    const result = await Tweet.aggregate([
      // ✅ أولاً نجيب التويته نفسها
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

      // ✅ جلب التعليقات
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "tweetId",
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "comments.userId",
          foreignField: "_id",
          as: "commentUsers",
        },
      },
      {
        $lookup: {
          from: "replyoncomments",
          localField: "comments._id",
          foreignField: "commentId",
          as: "replies",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "replies.userId",
          foreignField: "_id",
          as: "replyUsers",
        },
      },

      // ✅ تجهيز البيانات بتاعت التعليقات والردود مع المستخدمين
      {
        $addFields: {
          comments: {
            $map: {
              input: { $ifNull: ["$comments", []] },
              as: "comment",
              in: {
                _id: "$$comment._id",
                content: "$$comment.content",
                createdAt: "$$comment.createdAt",
                userData: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$commentUsers",
                        as: "cu",
                        cond: { $eq: ["$$cu._id", "$$comment.userId"] },
                      },
                    },
                    0,
                  ],
                },
                replies: {
                  $map: {
                    input: {
                      $filter: {
                        input: { $ifNull: ["$replies", []] },
                        as: "r",
                        cond: { $eq: ["$$r.commentId", "$$comment._id"] },
                      },
                    },
                    as: "reply",
                    in: {
                      _id: "$$reply._id",
                      content: "$$reply.content",
                      createdAt: "$$reply.createdAt",
                      userData: {
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
                  },
                },
                repliesCount: {
                  $size: {
                    $filter: {
                      input: { $ifNull: ["$replies", []] },
                      as: "r",
                      cond: { $eq: ["$$r.commentId", "$$comment._id"] },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ✅ حساب الإجماليات بطريقة آمنة
      {
        $addFields: {
          totalCommentsCount: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ["$comments", []] } }, 0] },
              then: { $size: { $ifNull: ["$comments", []] } },
              else: 0,
            },
          },
          totalCommentsAndRepliesCount: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ["$comments", []] } }, 0] },
              then: {
                $sum: {
                  $map: {
                    input: { $ifNull: ["$comments", []] },
                    as: "comment",
                    in: {
                      $add: [1, { $ifNull: ["$$comment.repliesCount", 0] }],
                    },
                  },
                },
              },
              else: 0,
            },
          },
          likesCount: {
            $size: { $ifNull: ["$likedBy", []] },
          },
          // ✅ هل المستخدم الحالي عامل لايك؟
          isLiked: {
            $in: [
              { $toObjectId: userId },
              { $ifNull: ["$likedBy", []] }
            ]
          }
        },
      },

      // ✅ اختيار الحقول اللي هنرجعها
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
          },
          comments: 1,
          totalCommentsCount: 1,
          totalCommentsAndRepliesCount: 1,
          likesCount: 1,
          isLiked: 1,
        },
      },
    ]);

    if (!result || result.length === 0) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en" ? "Tweet not found" : "التويته غير موجوده",
      });
    }

    return res.status(200).send({
      code: 200,
      status: true,
      message:
        lang === "en"
          ? "Tweet, comments, replies, and likes fetched successfully"
          : "تم جلب التويته والتعليقات والردود والاعجابات بنجاح",
      data: {
        tweet: result[0].tweet,
        comments: result[0].comments,
        totalCommentsCount: result[0].totalCommentsCount,
        totalCommentsAndRepliesCount:
          result[0].totalCommentsAndRepliesCount,
        likesCount: result[0].likesCount,
        isLiked: result[0].isLiked,
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
  getTweetWithCommentsAndReplies
}