import mongoose,{ Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
        
    },
    fullName:{
        type:String,
        required:true,
        
        lowercase:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String, //cloudinary:url
        required:true
    },
    coverImage:{
        type:String,
    },
    watchHistory:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    password:{
        type:String,
        required:[true,'Password is required']
    },
    refreshTokens:{
        type:String
    }

},
{
    timestamps:true
})
await userSchema.pre("save",async function (){
    if(!this.isModified("password")) return ;
    this.password=bcrypt.hash(this.password,10)
    

})
userSchema.methods.isPasswordCorrect= async function (password){
   return await bcrypt.compare(password,this.password)

}
userSchema.methods.generateAccessToken=function(){
    jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        Fullname:this.Fullname
    },process.env.ACCESS_TOKEN_SECRET,
process.env.ACCESS_TOKEN_EXPIRY
)
}
userSchema.methods.generateRefreshToken=function(){
       jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        Fullname:this.Fullname
    },process.env.REFRESH_TOKEN_SECRET,
process.env.REFRESH_TOKEN_EXPIRY
)
}


export const User = model("User", userSchema);