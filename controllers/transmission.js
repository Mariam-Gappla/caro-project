const Transimission=require("../models/transmission")
const addTransimission = async (req, res, next) => {
    try {
        const { nameEn, nameAr } = req.body;
        await Transimission.create({
            name: {
                en: nameEn,
                ar: nameAr
            }
        });
        return res.status(200).send({
            message: "FuelType added succesfully"
        })
    }
    catch (err) {
        next(err)
    }
}
const getTransimission = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en'
        const transimissions = await Transimission.find({});
        const formated = transimissions.map((body) => {
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
  addTransimission,
  getTransimission
}