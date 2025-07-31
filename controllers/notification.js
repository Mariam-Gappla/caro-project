const Notification = require("../models/notification");
const getMessages = require("../locales/schemaValiditionMessages/notificationValiditionMessages");

const getNotifications = async (req, res, next) => {
    const lang = req.headers["accept-language"] || "en";
    try {
        const targetId = req.user.id;
        const targetType = req.user.role; // لازم يكون عندك role في JWT: 'user' أو 'rentalOffice' أو 'serviceProvider'
         console.log(targetId)
         console.log(targetType)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { targetId, targetType };

        const totalNotifications = await Notification.countDocuments(filter);
        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const formattedNotifications = notifications.map((not) => ({
            title: not.title,
            message: not.message,
            date: not.createdAt,
        }));

        if (notifications.length === 0) {
            return res.status(200).send({
                status: true,
                code: 200,
                data:{
                notifications: [],
                pagination: {
                    page,
                    totalPages: Math.ceil(totalNotifications / limit),
                }
              }
                
            });
        }

        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en" ? "Notifications fetched successfully" : "تم جلب الإشعارات بنجاح",
            data: {
                notifications: formattedNotifications,
                pagination: {
                    page,
                    totalPages: Math.ceil(totalNotifications / limit),
                }
            }
        });
    } catch (err) {
        next(err);
    }
};
const addNotification = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const {
      targetId,
      targetType,
      orderId,
      orderModel,
      title,
      message
    } = req.body;

    // ✅ تحقق من البيانات المطلوبة
    if (!targetId || !targetType || !title || !message || !orderModel) {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === 'en' ? 'Missing required fields' : 'يوجد حقول مطلوبة مفقودة'
      });
    }

    const notification = new Notification({
      targetId,
      targetType,
      orderModel,
      orderId,
      title,
      message
    });

    await notification.save();

    return res.status(201).send({
      status: true,
      code: 201,
      message: lang === 'en' ? 'Notification sent successfully' : 'تم إرسال الإشعار بنجاح',
    });
  } catch (error) {
    next(error);
  }
};




module.exports = {
    getNotifications,
    addNotification
};
