const Post = require("../models/post");
const postSchema = require("../validation/postValidition");
const saveImage = require("../configration/saveImage");
const addPost = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
    const userId = req.user.id
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en" ? "Images are required" : "الصور مطلوبة"
      });
    }
    req.body.location = {
      lat: parseFloat(req.body["location.lat"]),
      long: parseFloat(req.body["location.long"])
    };
    delete req.body["location.lat"];
    delete req.body["location.long"];
    req.body.contactType = [req.body.contactType];
    const { error } = postSchema(lang).validate({ ...req.body, userId });
    if (error) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: error.details[0].message
      });
    }
    let imagePaths = [];
    files.forEach(file => {
      const imagePath = saveImage(file);
      imagePaths.push(`${BASE_URL}${imagePath}`);
    });
    await Post.create({
      ...req.body,
      userId: userId,
      images: imagePaths
    })

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

    // فلتر ديناميكي
    let matchFilter = { mainCategoryId: new mongoose.Types.ObjectId(categoryId) };

    // ✅ city حسب اللغة
    if (city) {
      matchFilter[`city.${lang}`] = city;
    }

    // ✅ area حسب اللغة
    if (area) {
      matchFilter[`area.${lang}`] = area;
    }

    // ✅ search برضه حسب اللغة (في العنوان والوصف)
    if (search) {
      matchFilter.$or = [
        { [`title.${lang}`]: { $regex: search, $options: "i" } },
        { [`description.${lang}`]: { $regex: search, $options: "i" } }
      ];
    }

    const posts = await Post.aggregate([
      { $match: matchFilter },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData"
        }
      },
      { $unwind: "$userData" },

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
          }
        }
      },
      {
        $project: {
          id: "$_id",
          createdAt: 1,
          images: 1,
          title: `$title.${lang}`,
          description: `$description.${lang}`,
          price: 1,
          city: `$city.${lang}`,
          area: `$area.${lang}`,
          totalCommentsAndReplies: 1,
          userData: {
            username: "$userData.username",
            image: "$userData.image",
            trust: "$userData.trust"
          }
        }
      }
    ]);

    res.status(200).send({
      status: true,
      code: 200,
      message:
        lang === "en"
          ? "Posts retrieved successfully"
          : "تم استرجاع المنشورات بنجاح",
      data: posts
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  addPost,
  getPostsByMainCategory
}