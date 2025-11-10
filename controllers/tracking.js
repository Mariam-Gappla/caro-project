const User = require("../models/user");
const activeSessions = new Map();
// === API: Start Tracking ===
const startTracking = (req, res) => {
    try {
         const lang = req.headers["accept-language"] || "en";
        const userId = req.user.id; // أو من req.body
        activeSessions.set(userId, true); // السماح بالإرسال
        res.send({
            status: true,
            code: 200,
            message: lang=="en"?"Tracking started":"بدأ التتبع"
        });
    }
    catch (err) {
        next(err)
    }
};

// === API: End Tracking ===
const endTracking = (req, res) => {
    try {
        const userId = req.user.id;
        activeSessions.delete(userId); // إيقاف الإرسال
        res.send({ 
            status:true,
            code:200,
            message: lang=="en"?"Tracking stopped":"تم ايقاف التتبع",
        });
    }
    catch(err)
    {
        next(err)
    }
};

// === Socket: Send Location ===
const sendLocation = async (userId, lat, long) => {
    if (!activeSessions.get(userId)) return null; // لو التتبع مش شغال، تجاهل

    // تحديث الموقع مباشرة في الموديل
    const user = await User.findByIdAndUpdate(
        userId,
        { location: { lat, long } },
        { new: true }
    );

    return user;
};
module.exports = {
    startTracking,
    endTracking,
    sendLocation
}

