import mongoose, {Schema} from 'mongoose';
const subscriptionSchema=new Schema({

    subscriber:{
        type:Schema.Types.ObjectId, //one whos subscribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId, //to subscribing
        ref:"User"
    }

},{timestamps:true})

export const Subscription=mongoose.model("Subscription",subscriptionSchema)
