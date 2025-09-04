const mongoose = require("mongoose");
const centerServiceSchema = mongoose.Schema({
    centerId: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    services: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service", // ربط مع Service
        }
    ],
    products: {
        type: [String],
        required: true
    },
})
const centerService = mongoose.model('CenterService', centerServiceSchema);
module.exports = centerService;