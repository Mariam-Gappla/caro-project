const mongoose = require("mongoose");
const carServicesSchema= new mongoose.Schema({
    name: { 
        en:{type:String,required:true} 
        ,ar:{type:String,required:true},
},});
module.exports = mongoose.model("CarServices", carServicesSchema);