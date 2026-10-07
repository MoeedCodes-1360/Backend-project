import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asynchandler} from "../utils/asyncWrapper.js"

const getChannelStats = asynchandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
   const  userId=req.user?._id
    if(!userId){
        throw new apiError(403,"Invalid user Id")
    }
    const totalSubscribers= await Subscription.countDocuments({
        channel:userId
    }) 

    const videoStats= await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes"
            }
        },
        {
            $group:{
                _id:null,
                totalVideos:{$sum: 1},
                totalViews:{$sum: "$views"},
                totalLikes:{$sum:{$size:"$likes"}}
            }

        }
    ])
    const states=videoStats[0]||
    {
        totalVideos:0,
        totalLikes:0,
        totalLikes:0
    }
    const channelStates={
        totalSubscribers,
        totalLikes:states.totalLikes,
        totalVideos:states.totalVideos,
        totalViews:state.totalVideos
    }
    return res
    .status(200)
    .json(new ApiResponse(200,channelStates,"States fetched successfully"))


})

const getChannelVideos = asynchandler(async (req, res) => {
    const userId=req.user?._id
    if(!userId){
        throw new apiError(403,"id not found")
    }
    const videos=await Video.find({owner:userId}).sort({createdAt: -1})

    return res
    .status(200)
    .json(new ApiResponse(200,videos,"videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }