import { Tweet } from "../models/tweets.model";
import {User} from "../models/tweets.model.js"
import { asynchandler } from "../utils/asyncWrapper.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {apiError} from "../utils/apiError.js"
import mongoose,{isValidObjectId}  from 'mongoose';


const createTweet= asynchandler(async (req,res)=>{
    const {title,content}=req.body;
    if(!title && title.trim()===""){
        throw new apiError(404,"title not found")
    }
    if(!content && content.trim()===""){
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
            throw new ApiError(400, "User not found")
        }
    if(isValidObjectId(userId)){
        throw new apiError(403,"invalid user id")
    }
    const tweet=

})

export {
    createTweet
}



