const { serviceWinchValidationSchema, serviceTireValidationSchema } = require("../validation/serviceProviderOrdersValidition");
const serviceProviderOrder = require("../models/serviceProviderOrders");
const providerRating = require("../models/providerRating");
const orderRating = require("../models/ratingForOrder");
const workSession = require("../models/workingSession");
const serviceProvider = require("../models/serviceProvider");
const winsh = require("../models/winsh");
const tire = require("../models/tire");
const path = require("path");
const fs = require("fs");
const saveImage = (file, folder = 'images') => {
  const fileName = `${Date.now()}-${file.originalname}`;
  const saveDir = path.join(__dirname, '..', folder);
  const filePath = path.join(saveDir, fileName);

  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
  }

  fs.writeFileSync(filePath, file.buffer);
  return `images/${fileName}`;
};
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
const getOrdersbyServiceType = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const providerId = req.user.id;
    console.log("providerId", providerId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const activeSession = await workSession.findOne({ providerId, isWorking: true });

    if (!activeSession) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === 'ar' ? "مزود الخدمة غير نشط حالياً" : "Service provider is not currently active"
      });
    }
    const verificationAccount = await winsh.findOne({ providerId }) || await tire.findOne({ providerId });
    const provider = await serviceProvider.findOne({ _id: providerId });

    if (!verificationAccount) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: lang === 'ar' ? "مقدم الخدمة غير موجود" : "Service provider not found"
      });
    }

    let filter = {};
    if (verificationAccount.serviceType === "tire Filling and battery Jumpstart") {
      filter.serviceType = { $in: ['tire Filling', 'battery Jumpstart'] };
    } else {
      filter.serviceType = verificationAccount.serviceType;
    }

    const totalOrders = await serviceProviderOrder.countDocuments(filter);
    const orders = await serviceProviderOrder.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username image');
    console.log(orders)
    if (!orders || orders.length === 0) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: lang === 'ar' ? "لا توجد طلبات" : "No orders found"
      });
    }

    const formattedOrders = [];

    for (let order of orders) {
      const ratingDocs = await providerRating.find({ userId: order.userId._id });
      const totalRating = ratingDocs.reduce((sum, doc) => sum + doc.rating, 0);
      const avgRating = ratingDocs.length > 0 ? (totalRating / ratingDocs.length).toFixed(1) : 0;

      let distanceToCar = null;
      let distanceToDropoff = null;

      if (verificationAccount.serviceType === 'winch') {
        if (
          order.carLocation?.lat && order.carLocation?.long &&
          provider.location?.lat && provider.location?.long
        ) {
          distanceToCar = haversineDistance(
            provider.location.lat,
            provider.location.long,
            order.carLocation.lat,
            order.carLocation.long
          ).toFixed(2);
        }

        if (
          order.carLocation?.lat && order.carLocation?.long &&
          order.dropoffLocation?.lat && order.dropoffLocation?.long
        ) {
          distanceToDropoff = haversineDistance(
            order.carLocation.lat,
            order.carLocation.long,
            order.dropoffLocation.lat,
            order.dropoffLocation.long
          ).toFixed(2);
        }

        formattedOrders.push({
          id: order._id,
          username: order.userId.username,
          image: order.userId.image,
          serviceType: order.serviceType,
          payment: order.payment,
          paymentType: order.paymentType,
          price: order.price,
          createdAt: order.createdAt,
          averageRating: avgRating,
          distanceToCar: distanceToCar ? `${distanceToCar} km` : "",
          distanceToDropoff: distanceToDropoff ? `${distanceToDropoff} km` : "",
        });

      } else {
        if (
          order.location?.lat && order.location?.long &&
          provider.location?.lat && provider.location?.long
        ) {
          distanceToCar = haversineDistance(
            provider.location.lat,
            provider.location.long,
            order.location.lat,
            order.location.long
          ).toFixed(2);
        }

        formattedOrders.push({
          id: order._id,
          username: order.userId.username,
          image: order.userId.image,
          serviceType: order.serviceType,
          payment: order.payment,
          paymentType: order.paymentType,
          price: order.price,
          createdAt: order.createdAt,
          averageRating: avgRating,
          distance: distanceToCar ? `${distanceToCar} km` : "",
        });
      }
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: lang === 'ar' ? "تم استرجاع الطلبات بنجاح" : "Orders retrieved successfully",
      data: {
        orders: formattedOrders,
        pagination: {
          Page: page,
          totalPages: Math.ceil(totalOrders / limit),
        }

      },
    });

  } catch (err) {
    next(err);
  }
};
const addWinchOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const lang = req.headers['accept-language'] || 'en';
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
    const file = req.file;
    console.log("req.file", req.file);
    const image = file ? `${BASE_URL}/images/${file.filename}` : "";
    req.body.location = {
      lat: Number(req.body['location.lat']),
      long: Number(req.body['location.long'])
    };
    req.body.carLocation = {
      lat: Number(req.body['carLocation.lat']),
      long: Number(req.body['carLocation.long'])
    };
    req.body.dropoffLocation = {
      lat: Number(req.body['dropoffLocation.lat']),
      long: Number(req.body['dropoffLocation.long'])
    };


    delete req.body['location.lat'];
    delete req.body['location.long'];
    delete req.body['carLocation.lat'];
    delete req.body['carLocation.long'];
    delete req.body['dropoffLocation.lat'];
    delete req.body['dropoffLocation.long'];
    const formatedData = {
      ...req.body,
      image: image,
      userId: userId,
    };

    console.log("formatedData", formatedData);

    const { error } = serviceWinchValidationSchema(lang).validate(formatedData);
    if (error) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: error.details[0].message,
      });
    }
    const savedImagePath = saveImage(file); // مثل: "abc.jpg"
    console.log(savedImagePath);
    formatedData.image = BASE_URL + savedImagePath;
    console.log(formatedData)
    await serviceProviderOrder.create(formatedData);
    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === 'ar' ? "تم إنشاء الطلب بنجاح" : "Order created successfully",
    });
  } catch (err) {
    next(err);
  }
};
const addTireOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const lang = req.headers['accept-language'] || 'en';
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
    const file = req.file;
    const image = file ? `${BASE_URL}/images/${file.filename}` : "";
    req.body.location = {
      lat: Number(req.body['location.lat']),
      long: Number(req.body['location.long'])
    };
    delete req.body['location.lat'];
    delete req.body['location.long'];
    const formatedData = {
      ...req.body,
      image: image,
      userId: userId
    };

    const { error } = serviceTireValidationSchema(lang).validate(formatedData);
    if (error) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: error.details[0].message,
      });
    }
    const savedImagePath = saveImage(file); // مثل: "abc.jpg"
    console.log(savedImagePath);
    formatedData.image = BASE_URL + savedImagePath;
    console.log(formatedData)
    await serviceProviderOrder.create(formatedData);
    return res.status(200).json({
      status: true,
      code: 200,
      message: lang === 'ar' ? "تم إنشاء الطلب بنجاح" : "Order created successfully",
    });
  } catch (err) {
    next(err);
  }
}
const getUserMakeOrderandRating = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const orderId = req.params.id;

    // 1. هات الأوردر بالمستخدم
    const order = await serviceProviderOrder
      .findOne({ _id: orderId })
      .populate('userId', 'username image');

    if (!order) {
      return res.status(400).send({
        status: false,
        code: 400,
        message:
          lang === 'ar' ? 'لم يتم العثور على الطلب' : 'Order not found',
      });
    }

    // 2. احسب المتوسط من تجميعة providerRating
    const ratingAgg = await providerRating.aggregate([
      { $match: { userId: order.userId._id } },
      {
        $group: {
          _id: '$userId',
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    const avgRating = ratingAgg.length > 0 ? ratingAgg[0].averageRating : 0;

    // 3. التنسيق النهائي
    const formatedData = {
      username: order.userId.username,
      image: order.userId.image,
      rating: Number(avgRating.toFixed(1)), // مثل: 4.5
    };

    return res.status(200).send({
      status: true,
      code: 200,
      message:
        lang === 'ar'
          ? 'تم استرجاع التقييم بنجاح'
          : 'Rating retrieved successfully',
      data: formatedData,
    });
  } catch (err) {
    next(err);
  }
};
const changeStatusForOrder = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const providerId = req.user.id;
    const role = req.user.role;
    if (role != "serviceProvider") {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang == "en" ? "not allow for you role should be serviceProvider" : "غير مسموح لك الدور يجب ان يكون موفر خدمه"
      })

    }
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === 'ar' ? "الرجاء توفير معرف الطلب والحالة" : "Please provide order ID and status"
      });
    }

    const order = await serviceProviderOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: lang === 'ar' ? "الطلب غير موجود" : "Order not found"
      });
    }
    if (status == "accepted") {
      order.status = "accepted";
      order.providerId = providerId; // تعيين معرف الموفر
      await order.save();
      return res.status(200).json({
        status: true,
        code: 200,
        message: lang === 'ar' ? "تم موافقه على الطلب بنجاح" : "Order accepted successfully"
      });

    }
    else {
      if (order.status === "refused") {
        order.status = "refused";
        await order.save();
        return res.status(200).send({
          status: true,
          code: 200,
          message: lang === 'ar' ? "تم رفض الطلب" : "Order refused successfully"
        });
      }

    }





  } catch (err) {
    next(err);
  }
};
const ordersAndProfit = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const providerId = req.user.id;

    // تحديد بداية ونهاية اليوم
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // استعلام الطلبات الخاصة بمقدم الخدمة خلال اليوم
    const orders = await serviceProviderOrder.find({
      providerId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const totalProfit = orders.reduce((sum, order) => {
      const price = Number(order.price);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    return res.status(200).json({
      status: true,
      code: 200,
      message: lang === 'ar' ? "تم حساب الأرباح وعدد الطلبات لليوم بنجاح" : "Today's profit and orders calculated successfully",
      data: {
        totalOrders: orders.length,
        totalProfit: totalProfit.toFixed(2)
      }
    });

  } catch (error) {
    next(error);
  }
};
const reportForProvider = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const providerId = req.user.id;

    // تحديد بداية ونهاية اليوم
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // استعلام الطلبات الخاصة بمقدم الخدمة خلال اليوم
    const orders = await serviceProviderOrder.find({
      providerId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const totalProfit = orders.reduce((sum, order) => {
      const price = Number(order.price);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    const ratings = await orderRating.find({
      providerId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    const sessions = await workSession.find({
      providerId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
      endTime: { $ne: null }
    });

    // 🧮 نحسب إجمالي عدد الساعات
    let totalMilliseconds = 0;

    for (let session of sessions) {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      totalMilliseconds += end - start;
    }

    const totalHours = (totalMilliseconds / (1000 * 60 * 60)).toFixed(2);
    return res.status(200).send({
      status: true,
      code: 200,
      data: {
        totalOrders: orders.length,
        totalProfit: totalProfit.toFixed(2),
        totalRatings: ratings.length,
        totalHours: totalHours
      }
    })

  }
  catch (error) {
    next(error)
  }
}




module.exports = {
  addWinchOrder,
  addTireOrder,
  getUserMakeOrderandRating,
  getOrdersbyServiceType,
  changeStatusForOrder,
  ordersAndProfit,
  reportForProvider
}