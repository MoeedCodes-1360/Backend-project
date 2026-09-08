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

import userRouter from './routes/user.routes.js';
app.use("/api/v1/users",userRouter)

export { app }

