const mongoose = require("mongoose");
const serviceProviderSchema = new mongoose.Schema({
    username: {
        type: "string",
    },
    email: {
        type: "string",
        match: /^[a-zA-z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/,
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: "string",
        required: true,
    },
    status:{
        type:String,
        enum:["pending","accepted","refused"],
        default:"pending"

    },
    location:{
        lat: {
            type: Number
        },
        long: {
            type: Number
        }
    },
    resetOtp: {
        type: Number
    },
    resetOtpExpires: {
        type: Date
    },
    image: {
        type: String,
        default: `${process.env.BASE_URL}images/rentalOffice.PNG`,
    },
    createdAt: { type: Date, default: Date.now },
});
const serviceProvider = mongoose.model("serviceProvider", serviceProviderSchema);
module.exports = serviceProvider;