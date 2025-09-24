const Cylinder=require("../models/cylinder")
const addCylinder = async (req, res, next) => {
    try {
        const { name} = req.body;
        await Cylinder.create({name:name});
        return res.status(200).send({
            message: "Cylinder added succesfully"
        })
    }
    catch (err) {
        next(err)
    }
}
const getCylinder = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en'
        const cylinders = await Cylinder.find({});
        const formated = cylinders.map((body) => {
            return {
                id: body._id,
                text: body.name
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
   addCylinder,
   getCylinder
}