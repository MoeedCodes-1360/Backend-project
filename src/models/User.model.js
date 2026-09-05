import mongoose,{ Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username:{
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
    Fullname:{
        type:String,
        required:true,
        
        lowercase:true,
        trim:true,
        index:true
    },
    avatar:{
        type:string, //cloudinary:url
        required:true
    },
    coverImage:{
        type:true,
    },
    watchHistory:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    password:{
        type:string,
        required:[true,'Password is required']
    },
    refreshTokens:{
        type:string
    }

},
{
    timestamps:true
})
userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next();
    this.password=bcrypt.hash(this.password,10)
    next()

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