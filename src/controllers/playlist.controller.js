import mongoose, {isValidObjectId} from "mongoose";
import {Video} from "../models/video.model.js"

import { Playlist } from "../models/playlist.model.js";
import {apiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asynchandler} from "../utils/asyncWrapper.js";


const createPlaylist = asynchandler(async (req, res) => {
    const {name, description} = req.body
    if(!name || !description){
throw new apiError(403,"name and description are required")

    }
    const user=req.user?._id
    const playlist=await Playlist.create({
        name:name,
        description:description,
        videos:[],
        owner:user

    })
return res
.status(200)
.json(new ApiResponse(200,playlist,"Playlist Created successfully"))

    
})

const getUserPlaylists = asynchandler(async (req, res) => {
    const {userId} = req.params
    if(!userId){
        throw new apiError(401,"no user found")
    }
    const playlists=await Playlist.find({owner:userId})
    res
    .status(200)
    .json(new ApiResponse(200,playlists,"Playlists fetched successfully"))
})

const getPlaylistById = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new apiError(401,"Invalid userId")
    }
    if(!playlistId){
        throw new apiError(403,"no Playlist found")
    }
    const playlist=await Playlist.findById(playlistId)
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"playlist found successfully"))
    
})

const addVideoToPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new apiError(400,"Invalid playlist and video id")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new apiError (400,"no video found")
    }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new apiError(400,"no playlist found")
    }
    if(playlist.owner.toString()!==req.user?.id){
        throw new apiError(403,"not authorized to change the playlist")
    }
    if(playlist.video.include(videoId)){
        throw new apiError(401,"video already in the playlist")
    }
    const updatedPlaylist= await Playlist.findByIdAndUpdate(playlistId,
        {
            $addToSet:{video:videoId}
        },
        {
            new:true
        }
    )
    return res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"Video Added successfully"))
})

const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params
     
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new apiError(400,"Invalid playlist and video id")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new apiError (400,"no video found")
    }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new apiError(400,"no playlist found")
    }
    if(playlist.owner.toString()!==req.user?.id){
        throw new apiError(403,"not authorized to change the playlist")
    }
    if(playlist.video.include(videoId)){
        throw new apiError(401,"video already in the playlist")
    }
    const updatedPlaylist= await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull:{video:videoId}
        },
        {
            new:true
        }
    )
    return res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"Video Added successfully"))

    

})

const deletePlaylist = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new apiError(400,"Invalid playlist Id")
    }
    const deletedPlaylist=await findByIdAndDelete(playlistId)
    return res
    .status(200)
    .json(200,deletedPlaylist,"playlist deleted successfully")
})

const updatePlaylist = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if (!isValidObjectId(playlistId)) {
            throw new ApiError(400, "Invalid playlist ID")
        }
    
        if (!name &&description) {
            throw new ApiError(400, "Name or Description is required")
        }
    
        const existingPlaylist = await Playlist.findById(playlistId)
        if (!existingPlaylist) {
            throw new ApiError(404, "Playlist not found")
        }
        if (existingPlaylist.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You don't have permission to update this playlist")
        }
        const playlist=await findByIdAndUpdate(playlistId,{
            $set:{
                name:name,
                description:description
            }
        },{
            new:true
        })
        return res
        .status(200)
        .json(new ApiResponse(200,playlist,"playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
