const Post = require("../models/post");
const postSchema = require("../validation/postValidition");
const Comment = require("../models/centerComments");
const Reply = require("../models/centerReplies");
const saveImage = require("../configration/saveImage");
const MainCategory = require("../models/mainCategoryActivity");
const MainCategoryCenter = require("../models/mainCategoryCenter");
const ShowRoomPosts = require("../models/showroomPost");
const mongoose = require("mongoose");
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
    images.forEach(file => {
      const imagePath = saveImage(file);
      imagePaths.push(`${BASE_URL}${imagePath}`);
    });

    let videoPath;
    if (video && video.length === 1) {
      videoPath = `${BASE_URL}${saveImage(video[0])}`;
    }

    await Post.create({
      ...req.body,
      userId: userId,
      images: imagePaths,
      video: videoPath || undefined
    });

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

    // pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // فلتر عام
    let matchFilter = { mainCategoryId: new mongoose.Types.ObjectId(categoryId) };

    // city filter
    if (req.query.cityId) {
      matchFilter.cityId = req.query.cityId;
    }

    // area filter
    if (req.query.areaId) {
      matchFilter.areaId= req.query.areaId;
    }

    // search filter
    if (req.query.search) {
      matchFilter.$or = [
        { title: { $regex: req.query.search, $options: "i" } }
      ];
    }
    let mainCategory
    mainCategory = await MainCategory.findById(categoryId);
    if(!mainCategory)
    {
      mainCategory = await MainCategoryCenter.findById(categoryId);
    }

    let posts = [];
    let totalCount = 0;

    // ✅ لو الكاتيجوري سيارات → نجيب من Posts و ShowroomPosts
    if (mainCategory && mainCategory.name.en === "cars") {
      const [normalPosts, showroomPosts] = await Promise.all([
        Post.find(matchFilter)
          .populate("userId", "username image status")
          .populate("cityId", `name.${lang}`)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        ShowRoomPosts.find()
          .populate("showroomId", "username image status")
          .populate("cityId", `name.${lang}`)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
      ]);

      posts = [...normalPosts, ...showroomPosts];

      // الحساب الكلي
      const [normalCount, showroomCount] = await Promise.all([
        Post.countDocuments(matchFilter),
        ShowRoomPosts.countDocuments()
      ]);
      totalCount = normalCount + showroomCount;
    } else {
      // ✅ غير كدا → نجيب من Posts بس
      posts = await Post.find(matchFilter)
        .populate("userId", "username image status")
        .populate("cityId", `name.${lang}`)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      totalCount = await Post.countDocuments(matchFilter);
    }

    // ✅ نحسب التعليقات والردود
    const postIds = posts.map(p => p._id);
    const [comments, replies] = await Promise.all([
      Comment.aggregate([
        { $match: { postId: { $in: postIds }, entityType: "Post" } },
        { $group: { _id: "$postId", count: { $sum: 1 } } }
      ]),
      Reply.aggregate([
        { $match: { postId: { $in: postIds } } },
        { $group: { _id: "$postId", count: { $sum: 1 } } }
      ])
    ]);

    const commentMap = {};
    comments.forEach(c => {
      commentMap[c._id.toString()] = c.count;
    });

    const replyMap = {};
    replies.forEach(r => {
      replyMap[r._id.toString()] = r.count;
    });

    // ✅ نعمل format موحّد للبوستات
    const formattedPosts = posts.map(post => {
      const commentCount = commentMap[post._id.toString()] || 0;
      const replyCount = replyMap[post._id.toString()] || 0;

      if (post.carNameId) {
        // Showroom Post
        return {
          id: post._id,
          createdAt: post.createdAt,
          images: post.images || [],
          title:post.title,
          price: post.price,
          city: post.cityId?.name?.[lang] || "",
          totalCommentsAndReplies: commentCount + replyCount,
          user: {
            username: post.showroomId.username,
            image: post.showroomId.image,
            status:post.showroomId.status
          }
            
          
        };
      } else {
        // Normal Post
        return {
          id: post._id,
          createdAt: post.createdAt,
          images: post.images || [],
          title: post.title, // عشان الـ Post عنده title جاهز
          price: post.price,
          city: post.cityId?.name?.[lang] || "",
          totalCommentsAndReplies: commentCount + replyCount,
          user:{
            username: post.userId.username,
            image: post.userId.image,
            status:post.userId.status
          }
        };
      }
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
const getPostById= async (req,res,next)=>{
  try {
    const lang = req.headers["accept-language"] || "en";
    const postId = req.params.id;
    let post = await Post.findById(postId).populate("userId", "username image").lean();
    if(!post)
    {
      post = await ShowRoomPosts.findById(postId).populate("showroomId", "username image").lean();
    }
      
    const formatedPost={
      id: post._id,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      video: post.video || null,
      images: post.images || null,
      title: post.title,
      description: post.description,
      contactType: post.contactType,
      contactValue: post.contactValue || null,
        user: {
            username: post.userId.username,
            image: post.userId.image,
          }
    }
    if(!post){
      return res.status(404).send({
        status: false,
        code: 404,
        message: lang === "en" ? "Post not found" : "المنشور غير موجود"
      });
    }
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en" ? "Post retrieved successfully" : "تم استرجاع المنشور بنجاح",
      data: formatedPost
    });
  } catch (error) {
    next(error);
  }
}





module.exports = {
  addPost,
  getPostsByMainCategory,
  getPostById
}
