const ShowRoomPosts = require("../models/showroomPost");
const getNextOrderNumber = require("../controllers/counter");
const showroomPostSchema = require("../validation/showroomPostsValidition");
const saveImage = require("../configration/saveImage");
const Reel = require("../models/reels")
const addShowroomPost = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/';
    console.log(req.body.year);
    // ✅ نتأكد إن services و advantages Arrays
    if (req.body.services && !Array.isArray(req.body.services)) {
      req.body.services = [req.body.services];
    }
    if (req.body.advantages && !Array.isArray(req.body.advantages)) {
      req.body.advantages = [req.body.advantages];
    }
    req.body.year = Number(req.body.year);

    const { error } = showroomPostSchema(lang).validate(req.body);
    if (error) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: error.details[0].message
      });
    }

    if (!req.files || !req.files.images || req.files.images.length === 0) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en" ? "At least one image is required" : "مطلوب صورة واحدة على الأقل"
      });
    }

    if (req.files.video && req.files.video.length > 1) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === "en"
          ? "Only one video is allowed"
          : "مسموح برفع فيديو واحد فقط"
      });
    }

    const images = req.files.images;
    const video = req.files.video;
    const imagePaths = images.map(img => BASE_URL + saveImage(img));
    const videoPath = video ? BASE_URL + saveImage(video[0]) : "";
    const counter = await getNextOrderNumber("showroomPost");
    req.body.postNumber = counter;

    const showroom = await ShowRoomPosts.create({
      ...req.body,
      images: imagePaths,
      video: videoPath
    });
    if (videoPath) {
      await Reel.create({
        video: showroom.video,
        title: showroom.title,
        createdBy: showroom.showroomId
      });
    }

    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en"
        ? "Showroom post added successfully"
        : "تمت إضافة منشور المعرض بنجاح"
    });
  } catch (error) {
    next(error);
  }
};
const getShowroomPosts = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 🟢 فلترة ديناميكية
    const filteration = {};

    if (req.query.model) {
      filteration.carModelId = req.query.modelId; // ObjectId
    }
    if (req.query.type) {
      filteration.carTypeId = req.query.typeId; // ObjectId
    }
    if (req.query.carCondition) {
      filteration.carConditionId = req.query.carConditionId; // new/used
    }
    if (req.query.year) {
      filteration.year = parseInt(req.query.year); // year as number
    }

    // 🟢 query مع الفلترة
    const showroomPosts = await ShowRoomPosts.find(filteration).populate("transmissionTypeId").populate("carConditionId")
      .populate("carNameId").populate("carModelId").populate("carTypeId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formatedShowRoomPosts = showroomPosts.map((post) => {
      return {
        id: post._id,
        title: lang == "en" ? "Car" : "سياره",
        transmissionType: post.transmissionTypeId.name[lang],
        carCondition: post.carConditionId.name[lang],
        carType: post.carTypeId.type[lang],
        carModel: post.carModelId.model[lang],
        carName: post.carNameId.carName[lang],
        financing: post.financing


      }
    })
    // 🟢 عدد الصفحات
    const totalDocs = await ShowRoomPosts.countDocuments(filteration);
    const totalPages = Math.ceil(totalDocs / limit);

    return res.status(200).send({
      status: true,
      code: 200,
      message:
        lang === "en"
          ? "Showroom posts retrieved successfully"
          : "تم استرجاع منشورات المعرض بنجاح",
      data: {
        posts: formatedShowRoomPosts,
        pagination: {
          page,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
const getPostById = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const postId = req.params.id;

    const post = await ShowRoomPosts.findById(postId)
      .populate("carNameId")
      .populate("carModelId")
      .populate("carTypeId")
      .populate("cityId")
      .populate("transmissionTypeId")
      .populate("fuelTypeId")
      .populate("carBodyId")
      .populate("cylindersId")
      .populate("carConditionId")
      .populate("deliveryOptionId")
      .lean();

    if (!post) {
      return res.status(404).send({
        status: false,
        code: 404,
        message: lang === "en" ? "Post not found" : "المنشور غير موجود",
      });
    }

    // ✅ نعمل Format نضيف بس اللي محتاجينه
    const formatedPost = {
      id: post._id,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      video: post.video || null,
      images: post.images || [],
      title: post.title,
      price: post.price,
      specifications: [
        { financing: post.financing },
        { year: post.year }, { fuelType: post.fuelTypeId.name[lang] },
        { cylinders: post.cylindersId.name[lang] }, { carCondition: post.carConditionId.name[lang] },
        { interiorColor: post.interiorColor }, { exteriorColor: post.exteriorColor },
        { transmissionType: post.transmissionTypeId.name[lang] }],
      discount: post.discount,
      discountedPrice: post.discountedPrice,
      financing: post.financing,
      description: post.discription,
      services: post.deliveryOptionId.name[lang],
      advantages: post.advantages,
      postNumber: post.postNumber,

      // ✅ ناخد بس النصوص بدل الـ object كله
      carType: post.carTypeId?.type?.[lang] || "",
      carModel: post.carModelId?.model?.[lang] || "",
      carName: post.carNameId?.carName?.[lang] || "",
      city: post.cityId?.name?.[lang] || "",

      showroomId: post.showroomId, // تسيبيه زي ماهو عشان ممكن تحتاجي بياناته بعدين
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
  } catch (error) {
    next(error);
  }
};





module.exports = { addShowroomPost, getShowroomPosts, getPostById };



