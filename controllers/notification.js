const Notification = require("../models/notification");
const getMessages = require("../locales/schemaValiditionMessages/notificationValiditionMessages");

const getRentalOfficeNotifications = async (req, res, next) => {
    const lang = req.headers["accept-language"] || "en";
    try {
        const rentalOfficeId = req.user.id; // مفروض تكون جايه من JWT

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { rentalOfficeId };

        const totalNotifications = await Notification.countDocuments(filter);
        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 }) // الأحدث أولًا
            .skip(skip)
            .limit(limit);
        const formatedNotification=notifications.map((not)=>{
            return {
                title:not.title,
                message:not.message,
                date:not.createdAt
            }
        })
        if (notifications.length === 0) {
            return res.status(400).send({
                status: false,
                code: 400,
                message:
                    lang === "en"
                        ? "No notifications found"
                        : "لا توجد إشعارات حاليًا"
            });
        }

        return res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en" ? "Notifications fetched successfully" : "تم جلب الإشعارات بنجاح",
            data: {
                notifications:formatedNotification,
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

module.exports = {
    getRentalOfficeNotifications
};
