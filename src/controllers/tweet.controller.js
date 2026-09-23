import { Tweet } from "../models/tweets.model";
import {User} from "../models/User.model.js"
import { asynchandler } from "../utils/asyncWrapper.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {apiError} from "../utils/apiError.js"
import mongoose,{isValidObjectId}  from 'mongoose';


const createTweet= asynchandler(async (req,res)=>{
    const {title,content}=req.body;
    if(title && title.trim()===""){
        throw new apiError(404,"title not found")
    }
    if(content && content.trim()===""){
        throw new apiError(404,"content not found")
    }

    const owner=req.user._id;

    const tweet=await Tweet.create({
        title:title,
        content,
        owner
    })
    if(!tweet){
        throw new apiError(403,"tweet creation failed")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"tweet created successfully"))
})

const getUserTweets=asynchandler(async (req,res)=>{
    const {userId}=req.params;
    if (!userId) {
            throw new apiError(400, "User not found")
        }
    if(!isValidObjectId(userId)){
        throw new apiError(403,"invalid user id")
    }
    const tweets=await Tweet.find({owner:userId}).sort({createdAt:-1})
    if(!tweets){
        throw new apiError(404,"no tweet found")
    }
    return res.
    status(200)
    .json(new ApiResponse(200,tweets,"tweets fetched successfully "))

})
const updateTweet=asynchandler(async (req,res)=>{
    const {tweetId}=req.params
    const {title,content}=req.body
    if(!isValidObjectId(tweetId)){
        throw new apiError(400,"bad request")
    }
    if((!title?.trim()) ||(!content.trim()==="")){
        throw new apiError(403,"no change to save")
    }
    const tweet=await Tweet.findById(tweetId)
    if(!tweet){
        throw new apiError(404,"tweet not found")
    }
    if(tweet.owner.toString()!==req.user._id){
        throw new apiError(401,"unauthorized access denied")

    }
    const updatedTweet=await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
        title,
        content:content,
        },
        
    },{new:true})
    return res
    .status(200)
    .json(new ApiResponse(200,updatedTweet,"tweet updated successfully"))

})
const deleteTweet=asynchandler(async (req,res)=>{
    const {tweetId}=req.params
 if(!isValidObjectId(tweetId)){
        throw new apiError(400,"bad request")
    }
        const tweet=await Tweet.findById(tweetId)

    if(!tweet){
        throw new apiError(404,"tweet not found")
    }
    if(tweet.owner.toString()!==req.user._id){
        throw new apiError(401,"unauthorized access denied")

    }
    
    await Tweet.findByIdAndDelete(tweetId)
    return res
    .status(200)
    .json(new ApiResponse(200,{},"tweet deleted successfully"))

 
})
export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}



