const mongoose=require("mongoose");
const serviceProviderSchema= new mongoose.Schema({
    username:{
        required:true,
        type:"string",
    },
    email:{
        type:"string",
        match:/^[a-zA-z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/,
    },
    phone:{
        type:String,
        required:true
    },
     password:{
        type:"string",
        required:true,
    },
    image:{
        type:"string",
        default: `${process.env.BASE_URL}/images/rentalOffice.png`,
    },
    createdAt: { type: Date, default: Date.now },
});
const serviceProvider=mongoose.model("serviceProvider",serviceProviderSchema);
module.exports=serviceProvider;