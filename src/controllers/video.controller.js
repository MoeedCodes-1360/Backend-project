import { Video } from "../models/Video.model.js";
import { User } from "../models/User.model.js";
import { asynchandler } from "../utils/asyncWrapper.js";
import { apiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadImageCloudinary } from "../utils/cloudinary.js";

import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comments.model.js";
import { Like } from "../models/like.model.js";

const getAllVideos = asynchandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  if (userId && !isValidObjectId(userId)) {
    throw new apiError(404, "Invalid user id");
  }
  const pipeline = [];
  //from title or decription
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          {
            description: {
              $regex: query,
              $options: "i",
            },
          },
        ],
      },
    });
    if (userId) {
      pipeline.push({
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      });
    }
  }
  pipeline.push({
    $match: {
      isPublished: true,
    },
  });
  if (sortBy && sortType) {
    pipeline.push({
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  //   for owner details
  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              userName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$owner",
    }
  );
  const videoAggregate = Video.aggregate(pipeline);
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
  const videos = await Video.aggregatePaginate(videoAggregate, options);
});
const publishAVideo = asynchandler(async (req, res) => {
  const { title, description } = req.body;
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new apiError(400, "All fields are required");
  }
  const thumbnailLocalPath = req?.files?.thumbnail?.[0]?.path;
  const videoFileLocalPath = req?.files?.videoFile?.[0]?.path;
  if (!thumbnailLocalPath) {
    throw new apiError(404, "thumbnail is missing");
  }
  if (!videoFileLocalPath) {
    throw new apiError(404, "Video file is missing");
  }
  const thumbnail = await uploadImageCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    throw new apiError(400, "thumbnail upload failed");
  }
  const videoFile = await uploadImageCloudinary(videoFileLocalPath);
  if (!videoFile) {
    throw new apiError(400, "videoFile upload failed");
  }
  const video = await Video.create({
    title,
    description,
    thumbnail: thumbnail?.url,
    videoFile: videoFile?.url,
    duration: videoFile?.duration,
    owner: req.user._id,
  });
  const createdVideo = Video.findById(video._id);
  if (!createdVideo) {
    throw new apiError(500, "Video upload failed");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, createdVideo, "Video uploaded successfully"));
});
const getVideoById = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || !isValidObjectId(videoId)) {
    throw new apiError(400, "Valid video Id requeired");
  }
  const video = await Video.findById(videoId).populate(
    "owner",
    "userName avatar"
  );
  if (!video) {
    throw new apiError(404, "Video id is invalid");
  }
  await Video.findByIdAndUpdate(videoId, {
    $inc: { views: 1 },
  });
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { watchHistory: videoId },
    });
  }

  return res.status(200).json(new ApiResponse(200, video, "Video founded"));
});
const updateVideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  if (!title && !description) {
    throw new apiError(400, "nothing to update");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(404, "Video not found");
  }
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new apiError(403, "unauthorized access");
  }
  updatedFields = {};

  if (title) updatedFields.title = title;
  if (description) updatedFields.description = description;
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updatedFields,
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video Updated  successfully"));
});
const deleteVideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(404, "no Video found");
  }
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new apiError(403, "unauthorized Video deletion");
  }
  await Video.findByIdAndDelete(videoId);
  await Comment.deleteMany({ video: videoId });
  await Like.deleteMany({ video: videoId });
  return res.status(200).json(200, {}, "Video deleted successfully");
});
const togglePublish = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(404, "Video not Found");
  }
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new apiError(403, "unauthorized Video access");
  }
  video.isPublished = !video.isPublished;
  await video.save();
  return res
    .status(200)
    .json(
      ApiResponse(
        200,
        video,
        `${video.title} is ${video.isPublished ? `published` : "unpublished"}  successfully`
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublish,
};
