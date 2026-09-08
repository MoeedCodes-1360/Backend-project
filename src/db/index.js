import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);


import mongoose from "mongoose";

import { DB_NAME } from "../constant.js";
const connection = async () => {
  try {
    // console.log("url loaded:",!!process.env.MONGODB_URI);
    
   const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
   console.log("mongoDb Connected: ",connectionInstance.connection.host, connectionInstance.connection.port);

   
  } catch (error) {
    console.error("DB error: ", error);
    process.exit(1);
  }
};
export default connection;