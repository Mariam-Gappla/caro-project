const mongoose=require("mongoose");
const serviceProviderSchema= new mongoose.Schema({
    username:{
        required:true,
        type:"string",
    },
    email:{
        type:"string",
        required:true,
        unique:true,
        match:/^[a-zA-z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/,
    },
     password:{
        type:"string",
        required:true,
    },
    image:{
        type:"string",
        default: "http://localhost:3000/images/rentalOffice.png",
    },
    createdAt: { type: Date, default: Date.now },
});
const serviceProvider=mongoose.model("serviceProvider",serviceProviderSchema);
module.exports=serviceProvider;