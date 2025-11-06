const ServiceProviderPricing = require("../models/serviceProviderPrices")
const addWinchPricing = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const { distance, fixedPrice, openPrice } = req.body;

        await ServiceProviderPricing.findOneAndUpdate(
            {}, // مفيش شرط لأننا عايزين أول سجل بس
            {
                winchDistance: distance,
                winchFixedPrice: fixedPrice,
                winchOpenPrice: openPrice,
            },
            { upsert: true, new: true } // لو مفيش سجل ينشئه، لو فيه يعدله
        );

        res.status(200).send({
            status: true,
            code: 200,
            message:
                lang === "en"
                    ? "Winch pricing updated successfully"
                    : "تم تحديث أسعار الونش بنجاح",
        });
    } catch (err) {
        next(err);
    }
};
const addTirePricing = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const { distance, fixedPrice, openPrice } = req.body;

        await ServiceProviderPricing.findOneAndUpdate(
            {}, // مفيش شرط لأننا عايزين أول سجل بس
            {
                winchDistance: distance,
                winchFixedPrice: fixedPrice,
                winchOpenPrice: openPrice,
            },
            { upsert: true, new: true } // لو مفيش سجل ينشئه، لو فيه يعدله
        );

        res.status(200).send({
            status: true,
            code: 200,
            message: lang === "en"
                ? "tire filling pricing updated successfully"
                : "تم تحديث أسعار تعبئه كفر بنجاح",
        });
    }
    catch (err) {
        next(err)
    }
}
const addBatteryPricing = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const { start, end } = req.body;

        await ServiceProviderPricing.findOneAndUpdate(
            {}, // مفيش شرط لأننا عايزين أول سجل بس
            {
                batteryStartPrice: start,
                batteryEndPrice: end,
            },
            { upsert: true, new: true } // لو مفيش سجل ينشئه، لو فيه يعدله
        );

        res.status(200).send({
            status: true,
            code: 200,
            message:
                lang === "en"
                    ? "battery Jumpstart pricing updated successfully"
                    : "تم تحديث أسعار اشتراك بطاريه بنجاح",
        });

    }
    catch (err) {
        next(err)
    }
}
const getPricing = async (req, res, next) => {
    try {
        const lang = req.headers["accept-language"] || "en";
        const { type } = req.body;

        // جلب أول مستند
        const pricing = await ServiceProviderPricing.findOne({});
        if (!pricing) {
            return res.status(404).json({
                status: false,
                code: 404,
                message: lang === "en" ? "Pricing not found" : "الاسعار غير موجودة",
                data: {}
            });
        }

        let formatted = {};
        const typeClean = type ? type.trim().toLowerCase() : "";

        if (typeClean === "tire") {
            formatted.start = pricing.tireStartPrice ?? 0;
            formatted.end = pricing.tireEndPrice ?? 0;
        } else if (typeClean === "battery") {
            formatted.start = pricing.batteryStartPrice ?? 0;
            formatted.end = pricing.batteryEndPrice ?? 0;
        } else {
            formatted = {
                tireStartPrice: pricing.tireStartPrice ?? 0,
                tireEndPrice: pricing.tireEndPrice ?? 0,
                batteryStartPrice: pricing.batteryStartPrice ?? 0,
                batteryEndPrice: pricing.batteryEndPrice ?? 0,
                winchDistance: pricing.winchDistance ?? 0,
                winchFixedPrice: pricing.winchFixedPrice ?? 0,
                winchOpenPrice: pricing.winchOpenPrice ?? 0
            };
        }

        return res.status(200).json({
            status: true,
            code: 200,
            message: lang === "en" ? "get pricing successfully" : "تم جلب الاسعار بنجاح",
            data: formatted
        });

    } catch (err) {
        next(err);
    }
};


module.exports = {
    addBatteryPricing,
    addTirePricing,
    addWinchPricing,
    getPricing
}