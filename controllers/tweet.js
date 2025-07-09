const Tweet = require("../models/tweets");
const { tweetValidationSchema } = require("../validation/tweetvalidition");
const Comment = require("../models/comments.js");
const getMessages = require("../configration/getmessages.js");
const Replies = require("../models/replyOnComments.js");
const path = require("path");
const mongoose = require("mongoose")
const fs = require("fs");
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

    // أنواع الملفات المسموحة
    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    const allowedVideoTypes = ["video/mp4", "video/quicktime"];

    let imagesUrls = [];
    let videoUrl = "";

    // ⬅️ التعامل مع الصور
    if (req.files?.images) {
      const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

      if (images.length > 3) {
        return res.status(400).send({
          code: 400,
          status: false,
          message: lang === 'en'
            ? "You can upload up to 3 images only"
            : "مسموح بحد أقصى ٣ صور فقط"
        });
      }

      for (const img of images) {
        if (!allowedImageTypes.includes(img.mimetype)) {
          return res.status(400).send({
            code: 400,
            status: false,
            message: lang === 'en'
              ? "Only JPG, PNG, or WEBP images are allowed."
              : "مسموح فقط بصور JPG أو PNG أو WEBP"
          });
        }

        const cleanImageName = img.originalname.replace(/\s+/g, '-');
        const fileName = `${Date.now()}-${cleanImageName}`;
        const filePath = path.join(__dirname, '../images', fileName);
        fs.writeFileSync(filePath, img.buffer);
        imagesUrls.push(BASE_URL + fileName);
      }
    }

    // ⬅️ التعامل مع الفيديو
    if (req.files?.video) {
      const videos = Array.isArray(req.files.video) ? req.files.video : [req.files.video];

      if (videos.length > 1) {
        return res.status(400).send({
          code: 400,
          status: false,
          message: lang === 'en'
            ? "Only one video is allowed"
            : "مسموح برفع فيديو واحد فقط"
        });
      }

      const video = videos[0];

      if (!allowedVideoTypes.includes(video.mimetype)) {
        return res.status(400).send({
          code: 400,
          status: false,
          message: lang === 'en'
            ? "Only MP4 or MOV videos are allowed."
            : "مسموح فقط بفيديوهات MP4 أو MOV"
        });
      }

      const cleanVideoName = video.originalname.replace(/\s+/g, '-');
      const fileName = `${Date.now()}-${cleanVideoName}`;
      const filePath = path.join(__dirname, '../images', fileName); // تقدر تغير المسار لو حابة
      fs.writeFileSync(filePath, video.buffer);
      videoUrl = BASE_URL + fileName;
    }

    // ⬅️ الحفظ في قاعدة البيانات
    const tweet = await Tweet.create({
      content,
      title,
      userId: id,
      images: imagesUrls,
      video: videoUrl
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
    const lang = req.headers['accept-language'] || 'en';

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalTweets = await Tweet.countDocuments();

    const result = await Tweet.aggregate([
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'tweetId',
          as: 'comments'
        }
      },
      {
        $lookup: {
          from: 'replyoncomments',
          localField: 'comments._id',
          foreignField: 'commentId',
          as: 'replies'
        }
      },
      {
        $addFields: {
          totalComments: { $add: [{ $size: '$comments' }, { $size: '$replies' }] }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          title: 1,
          content: 1,
          images: 1,
          video: 1,
          createdAt: 1,
          totalComments: 1,
          'user.username': 1,
          'user.image': 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const totalPages = Math.ceil(totalTweets / limit);

    res.status(200).send({
      code: 200,
      status: true,
      message: lang === "en"
        ? "Tweets fetched successfully"
        : "تم جلب التغريدات بنجاح",
      data: {
        tweets: result,
        pagination: {
          currentPage: page,
          totalPages: totalPages
        }
      }
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

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
      return res.status(400).send({
        code: 400,
        status: false,
        message: lang === "en" ? "Tweet ID is not valid" : "معرف التويت غير صحيح"
      });
    }

    const result = await Tweet.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(tweetId) }
      },
      // جلب بيانات صاحب التويتة
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $unwind: { path: '$userData', preserveNullAndEmptyArrays: true } },

      // جلب التعليقات
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'tweetId',
          as: 'comments'
        }
      },
      {
        $unwind: {
          path: '$comments',
          preserveNullAndEmptyArrays: true
        }
      },

      // بيانات مستخدم التعليق
      {
        $lookup: {
          from: 'users',
          localField: 'comments.userId',
          foreignField: '_id',
          as: 'commentUser'
        }
      },
      {
        $unwind: {
          path: '$commentUser',
          preserveNullAndEmptyArrays: true
        }
      },

      // الردود على التعليق
      {
        $lookup: {
          from: 'replyoncomments',
          localField: 'comments._id',
          foreignField: 'commentId',
          as: 'replies'
        }
      },
      {
        $unwind: {
          path: '$replies',
          preserveNullAndEmptyArrays: true
        }
      },

      // بيانات مستخدم الرد
      {
        $lookup: {
          from: 'users',
          localField: 'replies.userId',
          foreignField: '_id',
          as: 'replyUser'
        }
      },
      {
        $unwind: {
          path: '$replyUser',
          preserveNullAndEmptyArrays: true
        }
      },

      // تجميع الردود داخل كل تعليق
      {
        $group: {
          _id: {
            tweetId: '$_id',
            commentId: '$comments._id'
          },
          tweet: { $first: '$$ROOT' },
          comment: { $first: '$comments' },
          commentUser: { $first: '$commentUser' },
          replies: {
            $push: {
              _id: '$replies._id',
              content: '$replies.content',
              createdAt: '$replies.createdAt',
              userData: {
                username: '$replyUser.username',
                image: '$replyUser.image'
              }
            }
          }
        }
      },

      // تجميع التعليقات داخل التويتة
      {
        $group: {
          _id: '$_id.tweetId',
          tweet: { $first: '$tweet' },
          tweetUser: { $first: '$tweet.userData' },
          comments: {
            $push: {
              $mergeObjects: [
                {
                  _id: '$comment._id',
                  content: '$comment.content',
                  createdAt: '$comment.createdAt'
                },
                {
                  userData: {
                    username: '$commentUser.username',
                    image: '$commentUser.image'
                  },
                  replies: '$replies'
                }
              ]
            }
          }
        }
      },

      // عرض النتيجة النهائية
      {
        $project: {
          _id: 0,
          tweet: {
            _id: '$tweet._id',
            title: '$tweet.title',
            content: '$tweet.content',
            images: '$tweet.images',
            video: '$tweet.video',
            createdAt: '$tweet.createdAt',
            userData: {
              username: '$tweetUser.username',
              image: '$tweetUser.image'
            }
          },
          comments: 1
        }
      }
    ]);

    if (!result || result.length === 0) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang=="en"?"Tweet not found":"التويته غير موجوده"
      });
    }

    return res.status(200).send({
      code: 200,
      status: true,
      message:lang=="en"?"Tweet, comments, and replies fetched successfully":"تم جلب التويته والتعليقات والردود بنجاح",
      data: {
        tweet: result[0].tweet,
        comments: result[0].comments
      }
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