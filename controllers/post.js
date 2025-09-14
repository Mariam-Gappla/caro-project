const Post = require("../models/post");
const postSchema = require("../validation/postValidition");
const saveImage = require("../configration/saveImage");
const mongoose = require("mongoose");
const addPost = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
    const userId = req.user.id
    const images = req.files.images;
    const video= req.files.video;
    if (!images || images.length === 0) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en" ? "Images are required" : "الصور مطلوبة"
      });
    }
    if(!video || video.length==0)
    {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en" ? "video are required" : "الفيديو مطلوبة"
      });
    }
    req.body.location = {
      lat: parseFloat(req.body["location.lat"]),
      long: parseFloat(req.body["location.long"])
    };
    delete req.body["location.lat"];
    delete req.body["location.long"];
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
    let videoPaths=[];
    images.forEach(file => {
      const imagePath = saveImage(file);
      console.log("imagePath:", imagePath);
      imagePaths.push(`${BASE_URL}${imagePath}`);
    });
    video.forEach(file => {
      const videoPath = saveImage(file);
      videoPaths.push(`${BASE_URL}${videoPath}`);
    })
    await Post.create({
      ...req.body,
      userId: userId,
      images: imagePaths,
      video:videoPaths
    });
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en" ? "Post added successfully" : "تم إضافة المنشور بنجاح"
    });

  }
  catch (err) {
    next(err)
  }
}
const getPostsByMainCategory = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const categoryId = req.params.categoryId;

    const city = req.query.city;
    const area = req.query.area;
    const search = req.query.search;

    // pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // فلتر ديناميكي
    let matchFilter = { mainCategoryId: new mongoose.Types.ObjectId(categoryId) };

    if (city) {
      matchFilter[`city.${lang}`] = city;
    }

    if (area) {
      matchFilter[`area.${lang}`] = area;
    }

    if (search) {
      matchFilter.$or = [
        { [`title`]: { $regex: search, $options: "i" } },
        { [`description`]: { $regex: search, $options: "i" } }
      ];
    }

    const posts = await Post.aggregate([
      { $match: matchFilter },

      // user data
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData"
        }
      },
      { $unwind: "$userData" },

      // city data
      {
        $lookup: {
          from: "cities",
          localField: "cityId",
          foreignField: "_id",
          as: "cityData"
        }
      },
      { $unwind: { path: "$cityData", preserveNullAndEmptyArrays: true } },

      // area data
      {
        $lookup: {
          from: "areas",
          localField: "areaId",
          foreignField: "_id",
          as: "areaData"
        }
      },
      { $unwind: { path: "$areaData", preserveNullAndEmptyArrays: true } },

      // comments & replies
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          as: "comments"
        }
      },
      {
        $lookup: {
          from: "replies",
          localField: "comments._id",
          foreignField: "commentId",
          as: "replies"
        }
      },

      {
        $addFields: {
          commentsCount: { $size: "$comments" },
          repliesCount: { $size: "$replies" },
          totalCommentsAndReplies: {
            $add: [{ $size: "$comments" }, { $size: "$replies" }]
          },

          // ✅ نخليهم حسب اللغة
          title: `$title.${lang}`,
          description: `$description.${lang}`,
          city: `$cityData.name.${lang}`,
          area: `$areaData.name.${lang}`
        }
      },

      {
        $project: {
          id: "$_id",
          createdAt: 1,
          images: 1,
          title: 1,
          description: 1,
          price: 1,
          city: 1,
          area: 1,
          totalCommentsAndReplies: 1,
          userData: {
            username: "$userData.username",
            image: "$userData.image",
            trust: "$userData.trust"
          }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const totalCount = await Post.countDocuments(matchFilter);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    res.status(200).send({
      status: true,
      code: 200,
      message:
        lang === "en"
          ? "Posts retrieved successfully"
          : "تم استرجاع المنشورات بنجاح",
      data: {
        posts,
        pagination: {
          page,
          totalPages
        }
      }
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  addPost,
  getPostsByMainCategory
}