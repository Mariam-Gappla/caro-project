const mongoose=require('mongoose');
const centerCommentSchema=new mongoose.Schema({
    content:{
        type:String,
        required:true,
    },
    entityId:{
        type:mongoose.Types.ObjectId,
        required:true,
        refPath:'entityType'
    },
    entityType:{
        type:String,
        required:true,
        enum:["ShowRoomPosts","Post"]
    },
    userId:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'User'
    }

},{timestamps:true});
const CenterComment=mongoose.model('CenterComment',centerCommentSchema);
module.exports=CenterComment;