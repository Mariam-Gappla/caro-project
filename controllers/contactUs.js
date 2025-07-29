const { contactUsSchema } = require("../validation/contactUsValidition");
const contactUs = require("../models/contactUs");
const getMessages = require("../configration/getmessages");
const addcontactUs = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const messages = getMessages(lang);
        const role = req.user.role;
        const userId = req.user.id;
        const { error } = contactUsSchema(lang).validate(req.body);
        if (error) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: error.details[0].message
            });
        }
        const messageData = {
            name: req.body.name,
            phone: req.body.phone,
            message: req.body.message,
            senderType: role,
            senderId: userId
        };
        const newMessage = await contactUs.create(messageData);
        return res.status(200).send({
            status: true,
            code: 200,
            message: messages.contactus.success,
        });

    }
    catch (err) {
        next(err);
    }
}
module.exports = {
    addcontactUs
}