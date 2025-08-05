import { Router } from "express";
import { allVideos, oneVideo, searchVideo, uploadVideo } from "../controllers/video.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { uploadThumbnail } from "../config/cloudinary.js";

const videoRouter = Router()

videoRouter.post("/upload", protect, uploadThumbnail.single("thumbnail"), uploadVideo)
videoRouter.get("/all", allVideos)
videoRouter.get("/watch/:id", oneVideo)
videoRouter.get("/search", searchVideo)

export default videoRouter