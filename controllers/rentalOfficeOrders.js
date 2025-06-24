const rentalOfficeOrders = require("../models/rentalOfficeOrders");
const CarRental = require("../models/carRental");
const rentalOfficeOrder = require("../models/rentalOfficeOrders");
const rentalOfficeOrderSchema = require("../validation/rentalOfficeOrders");
const getMessages = require("../configration/getmessages");
const path = require("path");
const fs = require("fs");
const addOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const carId = req.params.id;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

        // معالجة اللوكيشن
        req.body.pickupLocation = {
            lat: Number(req.body['pickupLocation.lat']),
            long: Number(req.body['pickupLocation.long'])
        };
        delete req.body['pickupLocation.lat'];
        delete req.body['pickupLocation.long'];

        // التحقق من صحة البيانات
        const { error } = rentalOfficeOrderSchema(lang).validate({
            userId,
            carId,
            ...req.body
        });
        if (error) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: error.details[0].message
            });
        }

        // تأكد من وجود السيارة
        const existCar = await CarRental.findById(carId);
        if (!existCar) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: messages.rentalCar.existCar
            });
        }

        const rentalOfficeId = existCar.rentalOfficeId;

        // التحقق من التداخل مع حجوزات أخرى لنفس السيارة
        const { startDate, endDate } = req.body;
        const overlappingOrder = await rentalOfficeOrders.findOne({
            carId,
            $or: [
                {
                    startDate: { $lte: endDate },
                    endDate: { $gte: startDate }
                }
            ]
        });

        if (overlappingOrder) {
            return res.status(400).send({
                code: 400,
                status: false,
                message: lang=="en"?"The selected period is already booked" :"الفترة المختارة غير متاحة للحجز"
            });
        }

        // التحقق من صورة الرخصة
        const imageFiles = req.files.filter(f => f.fieldname === "licenseImage");

        if (imageFiles.length === 0) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.licenseImage.required
            });
        }

        if (imageFiles.length > 1) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.licenseImage.onlyOne
            });
        }

        const file = imageFiles[0];
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

        if (!allowedImageTypes.includes(file.mimetype)) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.order.licenseImage
            });
        }

        // حفظ صورة الرخصة
        const fileName = `${Date.now()}-${file.originalname}`;
        const saveDir = path.join(__dirname, '../images');
        const filePath = path.join(saveDir, fileName);

        if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, { recursive: true });
        }

        fs.writeFileSync(filePath, file.buffer);

        const fileUrl = `${BASE_URL}/images/${fileName}`;

        // إنشاء الطلب
        const order = await rentalOfficeOrders.create({
            userId,
            rentalOfficeId,
            carId,
            startDate,
            endDate,
            licenseImage: fileUrl,
            paymentMethod: req.body.paymentMethod,
            pickupLocation: req.body.pickupLocation,
            deliveryType: req.body.deliveryType,
            totalAmount: req.body.totalAmount
        });

        return res.status(200).send({
            status: true,
            code: 200,
            message: messages.order.addOrder,
            order
        });

    } catch (err) {
        next(err);
    }
};
const ordersForRentalOfficewithstatus = async (req, res, next) => {
    try {
        const rentalOfficeId = req.user.id;
        const status = req.query.status;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const now = new Date();

        const messages = getMessages(req.headers['accept-language'] || 'en');

        let filter = { rentalOfficeId };

        if (status === 'pending') {
            filter.status = 'pending';
        } else if (status === 'ended') {
            filter.status = "accepted"; // يعني متوافق عليه
            filter.endDate = { $lt: now }; // انتهت مدته
        } else if (status === 'available') {
            filter.status = "accepted"; // يعني متوافق عليه
            filter.endDate = { $gte: now }; // لسه مستمرة
        }

        const totalOrders = await rentalOfficeOrder.countDocuments(filter);

        const rawOrders = await rentalOfficeOrder
            .find(filter)
            .populate('carId')
            .skip(skip)
            .limit(limit)
            .lean();

        if (!rawOrders || rawOrders.length === 0) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.order.existOrders
            });
        }

        const formattedOrders = rawOrders.map(order => {
            const { carId, ...rest } = order;
            return {
                ...rest,
                carDetails: carId
            };
        });

        return res.status(200).send({
            status: true,
            code: 200,
            page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders,
            data: formattedOrders
        });

    } catch (err) {
        next(err);
    }
}

const getOrdersForRentalOfficeByWeekDay = async (req, res, next) => {
    try {
        const rentalOfficeId = req.user.id;
        const orders = await rentalOfficeOrder.find({ rentalOfficeId })
        if (!orders) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.order.existOrders
            })
        }
        const result = await rentalOfficeOrder.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                        $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                    }
                }
            },
            {
                $addFields: {
                    weekday: { $dayOfWeek: "$date" } // 1 (Sunday) to 7 (Saturday)
                }
            },
            {
                $group: {
                    _id: "$weekday",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        const days = {
            1: "Sunday",
            2: "Monday",
            3: "Tuesday",
            4: "Wednesday",
            5: "Thursday",
            6: "Friday",
            7: "Saturday"
        };

        const stats = result.map(r => ({
            day: days[r._id],
            count: r.count
        }));
        res.status(200).send({
            status: true,
            code: 200,
            data: stats
        })


    }
    catch (err) {
        next(err)
    }
}
const getOrderById = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        if (!orderId) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.order.orderId
            })
        }
        const rawComments = await rentalOfficeOrder.findById({ _id: orderId }).populate('carId');
        return res.status(200).send({
            status: true,
            code: 200,
            data: rawComments
        })


    }
    catch (error) {
        next(error)
    }
}
const acceptorder = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

        const videoFiles = req.files.filter(f => f.fieldname === "video");

        if (videoFiles.length === 0) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.rentalCar.video
            });
        }

        if (videoFiles.length > 1) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.rentalCar.onlyOneVideo
            });
        }

        const file = videoFiles[0];

        const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];

        if (!allowedVideoTypes.includes(file.mimetype)) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.rentalCar.invalidFormat
            });
        }

        const fileName = `${Date.now()}-${file.originalname}`;
        const saveDir = path.join(__dirname, '../images');
        const filePath = path.join(saveDir, fileName);

        if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, { recursive: true });
        }

        fs.writeFileSync(filePath, file.buffer);

        const fileUrl = `${BASE_URL}/images/${fileName}`;

        const order = await rentalOfficeOrder.findByIdAndUpdate(
            { _id: orderId },
            { status: "accepted" },
            { new: true }
        );

        if (!order) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: messages.order.notExist
            });
        }

        const updatedCar = await CarRental.findByIdAndUpdate(
            { _id: order.carId },
            { videoCar: fileUrl },
            { new: true }
        );

        return res.status(200).send({
            status: true,
            code: 200,
            message: messages.order.acceptedSuccess || "تم قبول الطلب ورفع فيديو السيارة بنجاح",
            order,
            car: updatedCar
        });

    } catch (error) {
        next(error);
    }
};
const getOrders = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        const rentalOfficeId = req.user.id;
        const now = new Date();

        // الطلبات التي تم تسليمها
        const deliveredOrders = await rentalOfficeOrder.find({ isDelivered: true, rentalOfficeId: rentalOfficeId });

        // الطلبات قيد الانتظار
        const pendingOrders = await rentalOfficeOrder.find({ status: "pending", rentalOfficeId: rentalOfficeId });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // الطلبات التي انتهى تاريخ تأجيرها (endDate < now)
        const expiredOrders = await rentalOfficeOrder.find({
            endDate: { $lt: today }, rentalOfficeId: rentalOfficeId
        });

        return res.status(200).send({
            status: true,
            code: 200,
            data: {
                deliveredOrders: deliveredOrders.length,
                pendingOrders: pendingOrders.length,
                expiredOrders: expiredOrders.length
            }
        });
    } catch (error) {
        next(error);
    }
};
const getBookedDays = async (req, res, next) => {
  try {
    const carId = req.params.carId;
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month); // من 1 إلى 12

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: "Invalid year or month",
      });
    }

    // احسب أول وآخر يوم في الشهر المطلوب
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59); // آخر يوم في الشهر

    // هات كل الحجوزات الخاصة بالعربية في هذا الشهر
    const orders = await rentalOfficeOrders.find({
      carId,
      $or: [
        {
          startDate: { $lte: endOfMonth },
          endDate: { $gte: startOfMonth },
        }
      ]
    });

    // استخرج كل الأيام المحجوزة داخل كل حجز
    const bookedDays = [];

    orders.forEach(order => {
      let currentDate = new Date(order.startDate);
      const endDate = new Date(order.endDate);

      while (currentDate <= endDate) {
        if (
          currentDate.getFullYear() === year &&
          currentDate.getMonth() === month - 1
        ) {
          // ضيف اليوم بصيغة yyyy-mm-dd
          bookedDays.push(currentDate.toISOString().split("T")[0]);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return res.status(200).send({
      status: true,
      code: 200,
      carId,
      year,
      month,
      bookedDays
    });

  } catch (error) {
    next(error);
  }
};
const getOrdersByRentalOffice = async (req, res, next) => {
  try {
    const rentalOfficeId = req.user.id; // من التوكن
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const messages = getMessages(req.headers['accept-language'] || 'en');

    // استعلام بعدد الطلبات
    const totalOrders = await rentalOfficeOrder.countDocuments({ rentalOfficeId });

    // جلب الطلبات ومعاها carId
    const orders = await rentalOfficeOrder.find({ rentalOfficeId })
      .populate('carId') // جلب بيانات العربية
      .skip(skip)
      .limit(limit)
      .lean();

    if (!orders || orders.length === 0) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: messages.order.existOrders || "لا توجد طلبات"
      });
    }

    // تحويل carId → carDetails
    const formattedOrders = orders.map(order => {
      const { carId, ...rest } = order;
      return {
        ...rest,
        carDetails: carId
      };
    });

    return res.status(200).send({
      status: true,
      code: 200,
      page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      data: formattedOrders
    });

  } catch (error) {
    next(error);
  }
};







module.exports = {
    addOrder,
    ordersForRentalOfficewithstatus,
    getOrdersForRentalOfficeByWeekDay,
    getOrderById,
    acceptorder,
    getOrders,
    getBookedDays,
    getOrdersByRentalOffice
}








