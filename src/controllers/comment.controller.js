import mongoose, { isValidObjectId } from "mongoose";

import { Comment } from "../models/comments.model.js";

import { asynchandler } from "../utils/asyncWrapper.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { apiError } from "../utils/apiError.js";

const getVideoComments = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(403, "Invalid id");
  }
  const comments = await Comment.find({ video: videoId }).sort({
    createdAt: -1,
  });
  if (!comments) {
    throw new apiError(404, "No comment found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comments, "comments fetched successfully"));
});
const addComment = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(videoId)) {
    throw new apiError(403, "Invalid id");
  }
  if (!content || content.trim() === "") {
    throw new apiError(403, "no content to add");
  }
  const comment = await Comment.create({
    content,
    owner: req.user._id,
    video: videoId,
  });
  if (!comment) {
    throw new apiError(403, "comment upload failed");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});
const updateComment = asynchandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new apiError(404, "Invalid id");
  }
  if (!content || content.trim() === "") {
    throw new apiError(403, "No content to be updated");
  }
  const comment = await Comment.findById(commentId);
  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new apiError(403, "Cant update this comment");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        commentId,
        owner,
        content: content,
        video,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment Updated successfully"));
});
const deleteComment = asynchandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new apiError(404, "Invalid id");
  }
  if (!content || content.trim() === "") {
    throw new apiError(403, "No content to be updated");
  }
  const comment = await Comment.findById(commentId);
  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new apiError(403, "Cant update this comment");
  }

  await Comment.findByIdAndDelete(commentId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment , updateComment,deleteComment };
