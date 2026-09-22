import mongoose, { Schema } from "mongoose";

const likeSchema=new Schema({
    video:{
        type:Schema.Types.ObjectId,
        ref:"video"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"Tweet"
    },
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment"

    },



    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }

},
{timestamps:true})


export const Like=new mongoose.model("Like",likeSchema) 