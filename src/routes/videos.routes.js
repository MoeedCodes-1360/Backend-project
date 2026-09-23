import { Router } from "express";
import{
    getAllVideos,
      publishAVideo,
      getVideoById,
      updateVideo,
      deleteVideo,
      togglePublish,
} from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


import { upload } from "../middlewares/multer.middleware.js";
const router=Router()
router.use(verifyJWT)

router.route("/")
.get(getAllVideos) 
.post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );
router.route("/:videoId")
.post(publishAVideo)
.get(getVideoById)
.patch(updateVideo)
.delete(deleteVideo)
router.route('/publish/:videoId').patch(togglePublish)
export default router