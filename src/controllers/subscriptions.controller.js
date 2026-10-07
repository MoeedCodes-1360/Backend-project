import {asynchandler}  from "../utils/asyncWrapper.js"
import mongoose,{isValidObjectId} from "mongoose"
import {apiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Subscription} from "../models/subscription.model.js"

const toggleSubscription = asynchandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new apiError(400,"Invalid id")
    }
    const subscriber=req.user._id
    const channel=channelId
    const subscribed= await Subscription.findOne({
        $and:[{subscriber:subscriber},{channel:channel}]
    })
    if(subscribed){
        await Subscription.findByIdAndDelete({subscriber,channel})
        return res
        .status(200)
        .json(new ApiResponse(200,{},"unsubscribed"))
    }
    else{
        const subscription=await Subscription.create({subscriber,channel})
             return res
        .status(200)
        .json(new ApiResponse(200,subscription,"Subscribed"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asynchandler(async (req, res) => {
    const {subscriberId} = req.params
    if(!isValidObjectId(Id)){
    throw new apiError(400,"Invalid id")
}
const subscribers=await Subscription.findOne({channel:subscriberId}).populate("subscriber","userName fullName avatar")
return res
.status(200)
.json(new ApiResponse(200,subscribers,"Subscribers fetched Successfully"))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asynchandler(async (req, res) => {
    const { channelId } = req.params
    const subscriberId=channelId
    if(!isValidObjectId(channelId)){
        throw new apiError(400,"Invalid id")
    }
    const channels=await Subscription.find({subscriber:subscriberId}).populate("channel","userName fullName avatar")
    return res
    .status(200)
    .json(new ApiResponse(200,channels,"channels fetched"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}