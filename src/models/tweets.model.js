import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.objectId,
        ref:"User"
    }


},{
    timestamps:true
})
tweetSchema.plugin(mongooseAggregatePaginate)
export const Tweet=mongoose.model("Tweet",tweetSchema)
