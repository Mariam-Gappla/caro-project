const mongoose = require('mongoose');
const contactUs = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    message:{
        type: String,
        required: true,
    }


});

const contactus = mongoose.model('ContactUs', contactUs);
module.exports = contactus;