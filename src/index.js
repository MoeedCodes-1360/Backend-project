import  connection from "./db/index.js";

import "dotenv/config";



connection()
.then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
})
.catch((err) => {
  console.error("Error connecting to the database:", err);
  process.exit(1);
});










































































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
