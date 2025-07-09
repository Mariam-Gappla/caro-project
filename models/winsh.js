const mongoose = require('mongoose');
const winshVerificationSchema = new mongoose.Schema({
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'serviceProvider', // الربط بالمستخدم
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    nationalId: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    iban: {
        type: String,
        required: true
    },
    bankAccountName: {
        type: String,
        required: true
    },
    winchType: {
        type: String,
        required: true
    },
    carPlateNumber: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'refused'],
        default: 'pending'
    },
    profileImage:{
       type: String
    },
    nationalIdImage:{
       type: String
    },
    licenseImage:{
       type: String
    },
    carRegistrationImage:{
       type: String
    },
    carImage:{
       type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('winshVerification', winshVerificationSchema);
