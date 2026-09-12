import { User } from "../models/User.model";
import { apiError } from "../utils/apiError";
import { asynchandler } from "../utils/asyncWrapper";
import { jwt } from 'jsonwebtoken';

export const verifyJWT=asynchandler(async (req,res,next)=>{
  try {
     const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
     if(!token){
      throw new apiError(401,"unauthoried req")
      return ;
     }
    const decodedToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user){
      throw new apiError(401,"Invalid Access Token")
  }
  req.user=user;
  next()
  } catch (error) {
    throw new apiError(401,error?.message || "something went wrong in auth")
    
  }
})