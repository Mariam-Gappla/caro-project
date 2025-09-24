const DeliveryOption=require("../models/deliveryOption");
const addDeliveryOption = async (req, res, next) => {
    try {
        const { nameEn, nameAr } = req.body;
        await DeliveryOption.create({
            name: {
                en: nameEn,
                ar: nameAr
            }
        });
        return res.status(200).send({
            message: "DeliveryOption added succesfully"
        })
    }
    catch (err) {
        next(err)
    }
}
const getDeliveryOption = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en'
        const deliveryoption = await DeliveryOption.find({});
        const formated = deliveryoption.map((body) => {
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
  addDeliveryOption,
  getDeliveryOption
}