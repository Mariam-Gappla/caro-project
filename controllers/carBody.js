const CarBody = require("../models/carBody");
const addCarBody = async (req, res, next) => {
    try {
        const { nameEn, nameAr } = req.body;
        await CarBody.create({
            name: {
                en: nameEn,
                ar: nameAr
            }
        });
        return res.status(200).send({
            message: "carBody added succesfully"
        })
    }
    catch (err) {
        next(err)
    }
}
const getCarBody = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en'
        const bodies = await CarBody.find({});
        const formatedBodies = bodies.map((body) => {
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
            data: formatedBodies
        })

    }
    catch (err) {
        next(err)
    }
}
module.exports = {
    addCarBody,
    getCarBody
}