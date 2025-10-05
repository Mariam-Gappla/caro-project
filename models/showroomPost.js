const mongoose=require("mongoose");
const showroomPostsSchema=new mongoose.Schema({
title:{type:String,required:true},
images:{type:[String],required:true},
video:{type:String},
deliveryOptionId:{type:mongoose.Schema.Types.ObjectId,ref:"DeliveryOption",required:true},
carNameId:{type:mongoose.Schema.Types.ObjectId,ref:"CarName",required:true},
carModelId:{type:mongoose.Schema.Types.ObjectId,ref:"CarModel",required:true},
carTypeId:{type:mongoose.Schema.Types.ObjectId,ref:"carType",required:true},
cityId:{type:mongoose.Schema.Types.ObjectId,ref:"City",required:true},
showroomId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
transmissionTypeId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"Transmission"},
fuelTypeId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"FuelType"},
carBodyId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"CarBody"},
cylindersId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"Cylinder"},
carConditionId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"Condition"},
interiorColor:{type:String,required:true},
exteriorColor:{type:String,required:true},
discription:{type:String,required:true},
advantages:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Advantage", 
    required: true
  }],
discount:{type:Boolean,required:true},
financing:{type:Boolean,required:true},
price:{type:Number,required:true},
discountedPrice:{type:Number},
postNumber:{type:Number,required:true}
},{timestamps:true});
const showroomPosts = mongoose.model("ShowRoomPosts", showroomPostsSchema);
module.exports = showroomPosts;