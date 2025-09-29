const mongoose=require('mongoose');
const ReelCommentSchema=new mongoose.Schema({
    content:{
        type:String,
        required:true,
    },
    reelId:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'Reel'
    },
    userId:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'User'
    }

},{timestamps:true});
const ReelComment=mongoose.model('ReelComment',ReelCommentSchema);
module.exports=ReelComment;