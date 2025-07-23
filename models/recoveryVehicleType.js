const mongoose = require("mongoose");

const recoveryVehicleTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
}, { timestamps: true }

);

module.exports = mongoose.model("RecoveryVehicleType", recoveryVehicleTypeSchema);
