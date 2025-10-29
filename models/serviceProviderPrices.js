const mongoose = require("mongoose");
const serviceProviderPricingSechema = new mongoose.Schema({
winchDistance:{
    type:Number
},
winchFixedPrice:{
    type:Number
},
winchOpenPrice:{
    type:Number
},
tireStartPrice:{
    type:Number
},
tireEndPrice:{
    type:Number
},
batteryStartPrice:{
type:Number
},
batteryEndPrice:{
    type:Number
}
},{timestamps:true});
const serviceProviderPricing  = mongoose.model("ServiceProviderPricing", serviceProviderPricingSechema);
module.exports = serviceProviderPricing ;