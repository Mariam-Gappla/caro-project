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
        const pricing = await ServiceProviderPricing.findOne({});
        let formated = {}
        if (type == "tire") {
            formated.start = pricing.tireStartPrice
            formated.end = pricing.tireEndPrice

        }
        else if (type == "battery") {
            formated.start = pricing.batteryStartPrice
            formated.end = pricing.batteryEndPrice
        }
        else
        {
            formated.winchDistance=pricing.winchDistance
            formated.winchFixedPrice=pricing.winchFixedPrice
            formated.winchOpenPrice=pricing.winchOpenPrice
        }
        return res.status(200).send({
            status:true,
            code:200,
            message:lang=="en"?"get pricing successfully":"تم جلب الاسعار بنجاح",
            data:formated
        })
    }
    catch (err) {
        next(err)
    }
}
module.exports = {
    addBatteryPricing,
    addTirePricing,
    addWinchPricing,
    getPricing
}