const mongoose = require('mongoose');
const carSchema = new mongoose.Schema({
    nameId: { type: mongoose.Schema.Types.ObjectId, ref: "CarName", required: true },
    modelId: { type: mongoose.Schema.Types.ObjectId, ref: "CarModel", required: true },
    images: [{ type: String }],
    carTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'carType', required: true },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City" ,required: true },
    carPrice: { type: Number },
    videoCar: { type: String },
    notes: { type: String },
    isFixedPrice: { type: Boolean, default: false },
    ownershipFeesIncluded: { type: Boolean, default: false },
    odeoMeter:{type:String,required:true},
    carNew:{type:Boolean,required:true},
    auctionStart: { type: Date },
    auctionEnd: { type: Date },
    phoneNumber: { type: String, required: true },
    priceAfterAuction:{type:Number},
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{ timestamps: true });
const Car = mongoose.model('Car', carSchema);
module.exports = Car;
