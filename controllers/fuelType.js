const FuelType=require("../models/fuelType");
const addFuelType = async (req, res, next) => {
    try {
        const { nameEn, nameAr } = req.body;
        await FuelType.create({
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
const getFuelType = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en'
        const  fuelTypes = await FuelType.find({});
        const formated = fuelTypes.map((body) => {
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
  addFuelType,
  getFuelType
}