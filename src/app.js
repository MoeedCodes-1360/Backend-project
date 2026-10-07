import  express  from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';


const app = express();
app.use(cors(
  // to allow frontend to access backend
   {                                                     
    origin:process.env.CORS_ORIGIN,
    credentials:true
  }
));
// to allow data to be sent in json format
app.use(express.json({limit:"16kb"}));
// to allow data to be sent in urlencoded format
app.use(express.urlencoded({extended:true,limit:"16kb"}));
// to allow cookies to be sent in requests
app.use(cookieParser());
// to serve static files
app.use(express.static('public'));
//routes

import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthCheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

app.use("/api/v1/healthStatus", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)



export { app }

