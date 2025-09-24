const Condition=require("../models/Condition");
const addCondition = async (req, res, next) => {
    try {
        const { nameEn, nameAr } = req.body;
        await Condition.create({
            name: {
                en: nameEn,
                ar: nameAr
            }
        });
        return res.status(200).send({
            message: "Condition added succesfully"
        })
    }
    catch (err) {
        next(err)
    }
}
const getCondition = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en'
        const condition = await Condition.find({});
        const formated = condition.map((body) => {
            return {
                id: body._id,
                text: body.name[lang]
            }
        });
        return res.status(200).send({
            status: true,
            code: 200,
            message: lang == "en"
                ? "Your request has been completed successfully"
                : "تمت معالجة الطلب بنجاح",
            data: formated
        })

    }
    catch (err) {
        next(err)
    }
}
module.exports = {
    addCondition,
    getCondition
}