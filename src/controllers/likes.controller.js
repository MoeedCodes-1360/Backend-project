import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asynchandler} from "../utils/asyncWrapper.js"
import { Video } from "../models/Video.model.js"
import { Tweet } from "../models/tweets.model.js"


const toggleVideoLike = asynchandler(async (req, res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new apiError(403,"invalid id")
    }
    const likedBy=req.user._id
    const video= await Video.findById(videoId)
    if(!video){
        throw new apiError(404,"no video found")
    }
    const existingLike=await Like.findOne({likedBy,video:videoId})
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
       return res
        .status(200)
        .json(new ApiResponse(200,{},"unliked"))
    }
    else{
        const like=await Like.create({likedBy,video:videoId})
        return res
        .status(200)
        .json(new ApiResponse(200,like,"liked"))

    }
})

const toggleCommentLike = asynchandler(async (req, res) => {
    const {commentId} = req.params
      if(!isValidObjectId(commentIdId)){
        throw new apiError(403,"invalid id")
    }
    const likedBy=req.user._id
    const comment= await Comment.findById(commentId)
    if(!comment){
        throw new apiError(404,"no comment found")
    }
    const existingLike=await Like.findOne({likedBy,comment:commentId})
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
       return res
        .status(200)
        .json(new ApiResponse(200,{},"unliked"))
    }
    else{
        const like=await Like.create({likedBy,comment:commentId})
        return res
        .status(200)
        .json(new ApiResponse(200,like,"liked"))

    }
})
    //TODO: toggle like on comment



const toggleTweetLike = asynchandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
     if(!isValidObjectId(tweetId)){
        throw new apiError(403,"invalid id")
    }
    const likedBy=req.user._id
    const tweet= await Tweet.findById(tweetId)
    if(!tweet){
        throw new apiError(404,"no twitter found")
    }
    const existingLike=await Like.findOne({likedBy,tweet:tweetId})
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
       return res
        .status(200)
        .json(new ApiResponse(200,{},"unliked"))
    }
    else{
        const like=await Like.create({likedBy,tweet:tweetId})
        return res
        .status(200)
        .json(new ApiResponse(200,like,"liked"))

    }
}
)

const getLikedVideos = asynchandler(async (req, res) => {
    //TODO: get all liked videos
    const userId=req.user._id
    const likedVideos=await Like.aggregate([

        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(userId),
                video:{$exists:true,$ne:null}
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video"
            }
        },{$unwind:"$video"}
        
    ])
    
    return res
    .status(200)
    .json(new ApiResponse(200,likedVideos,"fetched successfully"))

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}