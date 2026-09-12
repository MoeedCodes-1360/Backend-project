import { asynchandler } from "../utils/asyncWrapper.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/User.model.js";
import { uploadImageCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// first, get userData from form(we'll take from postman for now)
//check if data is correct and valid(according to requirements)
//if image present, upload it in cloudinary
// check if user already exist
//create object in db


// const str="                                          "
// console.log(str.length, "value= ",str, str.trim()=="" , str.trim()==="");

const generateAccessAndRefreshToken=async (userId)=>{
    try {
        const user=await User.findById(userId)
        const AccessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
    } catch (error) {
        throw new apiError(500,"Something went wrong while generating tokens")
    }
    return {AccessToken ,refreshToken}

}
const registerUser= asynchandler(async (req,res)=>{
    const {fullName,email,userName,password}=req.body
       // console.log("email:",password);
        // if(fullName==="") throw new apiError(400,"fullName is required")
        if(
                [fullName,email,userName,password].some((field)=>field?.trim()==="")

        ){
            throw new apiError(400,"All fields are required")
        }
     const existedUser=  await User.findOne({

            $or:[{userName},{email}]

        })
        if(existedUser)
        {
            throw new apiError(409,"User Already Exists")
        }

    const avatarLocalPath=    req.files?.avatar?.[0]?.path;
   const coverImageLocalPath= req.files?.coverImage?.[0]?.path;
//    console.log("AVATAR PATH:", avatarLocalPath);
// console.log("COVER PATH:", coverImageLocalPath);
   if(!avatarLocalPath){
    throw new apiError(400,"Avatar File is required");
    
   }
   const avatar= await uploadImageCloudinary(avatarLocalPath)
   console.log("CLOUDINARY AVATAR:", avatar);

   
   const coverImage=await uploadImageCloudinary(coverImageLocalPath)
if(!avatar){    throw new apiError(400,"upload failed");
}
 const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
   userName: userName.toLowerCase(),

})
  const createdUser=  await User.findById(user._id).select("-password -refreshTokens")
  if(!createdUser){
    throw new apiError(500,"something went wrong")
  }
  
 return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
 )


})
const loginUser=asynchandler(async(req,res)=>{
    const {email,userName,password}=req.body
    if (!email || !userName) {
        throw new apiError(400, "Email or Username is required");
    }
    if (!password) {
        throw new apiError(400, "Password is required");
    }
   const user= await User.findOne({
        $or:[{email},{userName}]
    })
    if(!user){
        throw new apiError(404,"No User found")
    }
   const isPasswordValid= await user.isPasswordCorrect(password)
   if (!isPasswordValid){
        throw new apiError(401,"Invalid Password")
   }
   const {accessToken,refreshToken}= await generateAccessAndRefreshToken(user._id)
    loggedInUser= await User.findById(user._id).select("-password -refreshToken")
    options={
        httpOnly:true,
        secure:true,
    }
    return res.status(200).
    cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,{
                user:loggedInUser,accessToken,refreshToken
            },
            "user Logged in successfully"
        )
    )
})
const logOutUser=asynchandler(async (req,res)=>{
   await User.findByIdAndUpdate(req.user._id,
        {
            $set:{refreshToken:undefined}
        },
        {
            new:true
        }
    ),
    const options={
        httpOnly:true,
        secure:true
    }
    res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged out"))
    
})

export {registerUser,
    loginUser,logOutUser
}