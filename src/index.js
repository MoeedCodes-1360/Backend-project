import  connection from "./db/index.js";
// import  dotenv from "dotenv";
import "dotenv/config";
// dotenv.config({path:'../.env'});


connection();










































































// import express from "express";
// const app= express();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (err) => {
//       console.log("app error: ", err);
//       throw err;
//     });
//   } catch (error) {
//     console.log("db error: ", error);
//     throw error;
//   }
// })();
// app.listen(process.env.PORT, () => {
//   console.log(`Server is running on port ${process.env.PORT}`);
// });
