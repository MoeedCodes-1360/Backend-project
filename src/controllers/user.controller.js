import { asynchandler } from "../utils/asyncWrapper.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/User.model.js";
import { uploadImageCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    // Access tokens are short-lived; refresh tokens keep the user signed in longer.
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save the refresh token so later refresh requests can be verified.
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    // console.log(accessToken,refreshToken);

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("Token error:",error);

    throw new apiError(500, "Something went wrong while generating tokens");
  }

};
const registerUser = asynchandler(async (req, res) => {
  const { fullName, email, userName, password } = req.body;
  // console.log("email:",password);
  // if(fullName==="") throw new apiError(400,"fullName is required")
  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existedUser) {
    throw new apiError(409, "User Already Exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  //    console.log("AVATAR PATH:", avatarLocalPath);
  // console.log("COVER PATH:", coverImageLocalPath);
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar File is required");
  }
  const avatar = await uploadImageCloudinary(avatarLocalPath);
  console.log("CLOUDINARY AVATAR:", avatar);

  const coverImage = await uploadImageCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new apiError(400, "upload failed");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new apiError(500, "something went wrong");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});
const loginUser = asynchandler(async (req, res) => {
  console.log("Login body:",req.body);

  const { email, userName, password } = req.body;
  if (!(email || userName)) {
    throw new apiError(400, "Email or Username is required");
  }
  if (!password) {
    throw new apiError(400, "Password is required");
  }
  const user = await User.findOne({
    $or: [{ email }, { userName }],
  });
  if (!user) {
    throw new apiError(404, "No User found");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid Password");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Local development uses HTTP; production uses cross-site secure cookies.
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user Logged in successfully"
      )
    );
});
const logOutUser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1},
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out"));
});
const refreshAccessToken = asynchandler(async (req, res) => {
  // Prefer a token sent explicitly in the body, then fall back to the cookie.
  const incomingRefreshToken =req.cookies?.refreshToken ||
    req.body?.refreshToken  ;
  if (!incomingRefreshToken) {
    throw new apiError(401, "Unauthorized request");
  }

  
  try {
    // This checks the signature and expiry before the token is used.
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken._id);
  if (!user) {
    throw new apiError(401, "Invalid refresh token");
  }

  // Only the refresh token saved for this user can create a new access token.
  if (incomingRefreshToken !== user.refreshToken) {
    throw new apiError(401, "Refresh token is expired or already used");
  }

  // Refreshing creates a new access token but keeps the refresh token unchanged.
  const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id);
  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken",newRefreshToken)
    .json(
      new ApiResponse(
        200,
        { accessToken },
        "Access token refreshed successfully"
      ))}
     catch (error) {
    throw new apiError(401, "Invalid or expired refresh token");
  }})

  

  
const changeCurrentPassword = asynchandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const passwordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!passwordCorrect) {
    throw new apiError(400, "Invalid old Password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change successfully"));
});
const getCurrentUser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});
const updateAccountDetails = asynchandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new apiError(400, "All fields are required");
  }
  // Return the updated document instead of the old version.
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asynchandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  
  
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is missing");
  }
  const avatar = await uploadImageCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new apiError(400, "Error while uploading on avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asynchandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new apiError(400, "coverImage file is missing");
  }
  const coverImage = await uploadImageCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new apiError(400, "Error while uploading on coverImage");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"));
});

const getUserChannelProfile = asynchandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new apiError(400, "user is missing");
  }
  const channel = await User.aggregate([
    {
      // The schema uses userName with a capital N, so match that exact field.
      $match: {
        userName: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channels",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscribers",
        as: "subscribed",
      },
    },
    {
      $addFields: {
        subscriptionCount: {
          $size: "$subscribers",
        },
        channelSubscribedtoCount: {
          $size: "$subscribed",
        },
        isubscribed: {
          $cond: {
            if: { $in: [req?.user?._id, "$subscribers.subscriber"] },
            then: true,

            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        subscriptionCount: 1,
        channelSubscribedtoCount: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new apiError(404, "channel doesnt exist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200,channel, "channel found successfully"));
});
const getWatchHistory=asynchandler(async (req,res)=>{
  // Convert the authenticated user's id into the ObjectId MongoDB expects.
    const user= await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[{
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[{
                            $project:{
                                fullName:1,
                                userName:1,
                                avatar:1
                            }
                        }]
                    }
                },
                {
                    $addFields:{
                          owner:{

                        $first:"$owner",
                    }}
                }
              ]
            }
        },
    ])
return res
.status(200)
.json(
    new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History fetched"

    )
)

})
export { 
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
};
