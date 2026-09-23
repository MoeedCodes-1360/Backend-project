import { asynchandler } from "../utils/asyncWrapper";
import { ApiResponse } from "../utils/ApiResponse";

const healthUpdate= asynchandler(async (req,res )=>{
   return res
    .status(200)
    .json(new ApiResponse(200,{},"Sab changa hai"))

})
export{
    healthUpdate
}