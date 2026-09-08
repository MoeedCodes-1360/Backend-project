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


const registerUser= asynchandler(async (req,res)=>{
    const {fullName,email,userName,password}=req.body
    console.log("email:",email);
    // console.log("email:",password);
        // if(fullName==="") throw new apiError(400,"fullName is required")
        if(
                [fullName,email,userName,password].some((field)=>field?.trim()==="")

        ){
            throw new apiError(400,"All fields are required")
        }
     const existedUser=   User.findOne({

            $or:[{userName},{email}]

        })
        if(existedUser)
        {
            throw new apiError(409,"User Already Exists")
        }
    const avatarLocalPath=    req.files?.avatar[0]?.path;
   const coverImageLocalPath= req.files?.coverImage[0]?.path;
   if(!avatarLocalPath){
    throw new apiError(400,"Avatar File is required");
    
   }
   const avatar= await uploadImageCloudinary(avatarLocalPath)
   const coverImage=await uploadImageCloudinary(coverImageLocalPath)
if(avatar){    throw new apiError(400,"Avatar File is required");
}
User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage.url || "",
    email,
   userName: userName.toLowerCase().select("-password -refreshTokens"),

})
  const createdUser=  await User.findById(User._id)
  if(!createdUser){
    throw new apiError(500,"something went wrong")
  }
 return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
 )


})

export {registerUser}