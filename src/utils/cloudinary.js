import dotenv from "dotenv"
dotenv.config() 
cloudinary.config({
    api_key: process.env.CL_API_KEY,
    api_secret: process.env.CL_API_SECRET,
    cloud_name: process.env.CL_PROJECT_NAME
});

import {v2 as cloudinary} from 'cloudinary';
import { log } from 'console';
import fs from 'fs';
//we got link from url while cloudinary holds our files
cloudinary.config({
    API_KEY: process.env.CL_API_KEY,
    API_SECRET: process.env.CL_API_SECRET,
    cloud_name: process.env.CL_PROJECT_NAME
})
 export const uploadImageCloudinary= async (filePath)=>{ 
    try {
        if(!filePath) return null;
        const response= await cloudinary.uploader.upload(filePath,{
            resource_type:"auto"
        })
        console.log("File uploaded successfully",response.url);
        return response;
        
        
    } catch (error) {
        fs.unlinkSync(filePath) //remove locally save files only when it fails
        return error
        
    }
}




