const rentalOffice = require("../models/rentalOffice");
const getMessages = require("../configration/getmessages")
const followersForRentalOffice = require("../models/followersForRentalOffice");
const bcrypt = require("bcrypt");
const Favorite = require("../models/favorite");
const ratingForOrder = require("../models/ratingForOrder");
const Admin = require("../models/admin");
const { saveImage } = require("../configration/saveImage");
const rentalOfficeSchema = require("../validation/rentalOfficeVerifyValidition");
const carRental = require("../models/carRental");
const Rating = require("../models/ratingPost");
const Name = require("../models/carName");
const Model = require("../models/carModel");
const getAllRentallOffice = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const userId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { lat, lng, cityId, search } = req.query;
    const maxDistance = 5000; // 5 كم افتراضي

    const filters = {};
    if (cityId) filters.cityId = cityId;
    if (search) filters.username = { $regex: search, $options: "i" };

    let allRentalOffice;

    if (lat && lng) {
      const pipeline = [
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            distanceField: "distance",
            spherical: true,
            maxDistance,
          },
        },
      ];

      if (filters.cityId) {
        pipeline.push({
          $match: { cityId: new mongoose.Types.ObjectId(filters.cityId) },
        });
      }

      if (filters.username) {
        pipeline.push({ $match: { username: filters.username } });
      }

      pipeline.push({ $skip: skip }, { $limit: limit });

      pipeline.push({
        $lookup: {
          from: "cities",
          localField: "cityId",
          foreignField: "_id",
          as: "city",
        },
      });
      pipeline.push({
        $unwind: { path: "$city", preserveNullAndEmptyArrays: true },
      });

      allRentalOffice = await rentalOffice.aggregate(pipeline);
    } else {
      allRentalOffice = await rentalOffice
        .find(filters)
        .populate("cityId")
        .skip(skip)
        .limit(limit);
    }

    // 🎯 هات التقييمات لمكاتب التأجير فقط
    const ratings = await Rating.aggregate([
      { $match: { entityType: "rentalOffice" } },
      {
        $group: {
          _id: "$entityId",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    // 🗺️ خريطة للتقييمات
    const ratingMap = {};
    ratings.forEach((r) => {
      ratingMap[r._id.toString()] = {
        avgRating: r.avgRating,
        count: r.count,
      };
    });

    const formattedOffices = await Promise.all(
      allRentalOffice.map(async (o) => {
        const follow = await followersForRentalOffice.findOne({
          userId,
          rentalOfficeId: o._id,
        });
        const favorite = await Favorite.findOne({
          entityType: "rentalOffice",
          entityId: o._id,
          userId,
        });

        return {
          id: o._id,
          username: o.username,
          image: o.image,
          details: o.details,
          city: o.cityId?.name?.[lang] || o.city?.name?.[lang] || "",
          rating: ratingMap[o._id.toString()]?.avgRating || 0,
          isFavorite: !!favorite,
          isFollowed: !!follow,
        };
      })
    );

    const total = await rentalOffice.countDocuments(filters);

    return res.status(200).json({
      code: 200,
      status: true,
      message:
        lang === "en"
          ? "Your request has been completed successfully"
          : "تمت معالجة الطلب بنجاح",
      data: {
        offices: formattedOffices,
        pagination: {
          page,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
const getRentalOfficeCar = async (req, res, next) => {
  const lang = req.headers['accept-language'] || 'en';
  const messages = getMessages(lang);

  try {
    const rentalOfficeId = req.user.id;
    const rentalType = req.query.rentalType;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // تأكد من وجود المكتب
    const existRentalOffice = await rentalOffice.findOne({ _id: rentalOfficeId });
    if (!existRentalOffice) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: messages.rentalOffice.existRentalOffice
      });
    }

    // عدّ العربيات أولًا
    const carFilter = { rentalOfficeId };
    if (rentalType) {
      carFilter.rentalType = rentalType;
    }

    const totalCars = await carRental.countDocuments(carFilter);
    const cars = await carRental.find(carFilter).skip(skip).limit(limit);
    const formatedCars = await Promise.all(
      cars.map(async (car) => {
        console.log(car)
        const name = await Name.findOne({ _id: car.nameId });
        const model = await Model.findOne({ _id: car.modelId });

        let title;
        if (rentalType === "weekly/daily") {
          title =
            lang === "ar"
              ? `تأجير سيارة ${name.carName.ar || ""} ${model?.model.ar || ""}`
              : `Renting a car ${name.carName.en || ""} ${model?.model.en || ""}`;
          return {
            id: car._id,
            title,
            rentalType: "weekly/daily",
            images: car.images,
            carDescription: car.carDescription,
            city: car.city,
            odoMeter: car.odoMeter,
            price: car.pricePerFreeKilometer ?? car.pricePerExtraKilometer,
          };
        } else {
          title =
            lang === "ar"
              ? `تملك سيارة ${name?.carName.ar || ""} ${model.model.ar || ""}`
              : `Owning a car ${name?.carName.en || ""} ${model.model.en || ""}`;
          return {
            id: car._id,
            title,
            rentalType: "rent to own",
            images: car.images,
            carDescription: car.carDescription,
            city: car.city,
            odoMeter: car.odoMeter,
            price: car.carPrice,
            monthlyPayment: car.monthlyPayment,
            finalPayment: car.finalPayment
          };
        }


      })
    );


    // Response
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en"
        ? "Your request has been completed successfully"
        : "تمت معالجة الطلب بنجاح",
      data: {
        cars: formatedCars,
        pagination: {
          page: page,
          totalPages: Math.ceil(totalCars / limit)
        }
      }
    });

  } catch (err) {
    next(err);
  }
};
const getRentalOfficeById = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const rentalOfficeId = req.params.id;
    const existRentalOffice = await rentalOffice.findOne({ _id: rentalOfficeId });
    if (!existRentalOffice) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: messages.rentalOffice.existRentalOffice
      });
    }
    const formattedOffice = {
      id: existRentalOffice._id,
      username: existRentalOffice.username,
      image: existRentalOffice.image,
    }
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === "en"
        ? "Your request has been completed successfully"
        : "تمت معالجة الطلب بنجاح",
      data: formattedOffice
    });

  }
  catch (error) {
    next(error)
  }
}
const getProfileData = async (req, res, next) => {
  try {
    const lang = req.headers["accept-language"] || "en";
    const rentalOfficeId = req.user.id;

    // 🟢 تحقق من وجود المكتب
    const existRentalOffice = await rentalOffice.findOne({ _id: rentalOfficeId });
    console.log(existRentalOffice)
    if (!existRentalOffice) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang == "en" ? "rentalOfice does not exist" : "هذا المكتب غير موجود",
      });
    }

    // ❤️ عدد اللايكات
    const favorite = await Favorite.find({ entityId: rentalOfficeId, entityType: 'rentalOffice' })

    // 👥 عدد المتابعين
    const followersCount = await followersForRentalOffice.countDocuments({ rentalOfficeId });

    // ⭐ حساب متوسط التقييم من RatingPost بناءً على entityId و entityType
    const result = await Rating.aggregate([
      {
        $match: {
          entityId: existRentalOffice._id,
          entityType: "rentalOffice",
        },
      },
      {
        $group: {
          _id: "$entityId", // ✅ كده هيكون id المكتب بدل null
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    // ✅ لو فيه تقييمات
    const averageRating = result.length > 0 ? result[0].averageRating.toFixed(1) : 0;

    // ✅ إرسال البيانات
    return res.status(200).send({
      status: true,
      code: 200,
      message:
        lang === "en"
          ? "Your request has been completed successfully"
          : "تمت معالجة الطلب بنجاح",
      data: {
        username: existRentalOffice.username,
        image: existRentalOffice.image,
        rating: averageRating,
        likes: favorite.length,
        followers: followersCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
const rentalOfficeVerified = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const file = req.file;
    if (!file) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang == "ar" ? "الصورة مطلوبة" : "Image is required"
      });
    }

    // ✅ استخرج lat,long من البودي
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

    // ❌ امسح الـ lat,long علشان مش محتاجينهم في الموديل
    delete req.body.lat;
    delete req.body.long;

    // ✅ Validation بعد ما ضفت location
    const { error } = rentalOfficeSchema(lang).validate(req.body);
    if (error) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: error.details[0].message
      });
    }

    // ✅ حفظ الصورة
    let imageUrl = saveImage(file);
    imageUrl = `${process.env.BASE_URL}${imageUrl}`;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await rentalOffice.create({...req.body, image: imageUrl, password: hashedPassword });
    /*
    const admin = await Admin.find({}); // أو حسب نظامك لو عندك أكتر من أدمن

    if (admin) {
      await sendNotificationToMany({
        target: admin,
        targetType: "admin",
        titleAr: "طلب تسجيل مكتب جديد",
        titleEn: "New Service rentalOffice Registration",
        messageAr: ` المستخدم ${existUser.username} قدم طلب ليصبح مكتب تأجير`,
        messageEn: `User ${existUser.username} has submitted a request to become a service provider`,
        lang: lang,
        actionType: "provider",
      });
    }
      */
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang == "ar" ? "تم التقديم بنجاح" : "Submitted successfully"
    });

  } catch (err) {
    next(err);
  }
};
const acceptUserAsrentalOffice = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const rentalOfficeId = req.params.id;
    const existrentalOffice = await rentalOffice.findOne({ _id: rentalOfficeId });
    if (!existrentalOffice) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang == "ar" ? "المكتب غير موجود" : "rentalOffice does not exist"
      });

    }
    existrentalOffice.status = 'accepted';
    await existrentalOffice.save();
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang == "ar" ? "تم قبول المكتب بنجاح" : "rentalOffice accepted successfully"
    });
  }  catch (error) {
      next(error)
  }
}

module.exports = {
  getAllRentallOffice,
  getRentalOfficeCar,
  getRentalOfficeById,
  getProfileData,
  rentalOfficeVerified,
  acceptUserAsrentalOffice
}