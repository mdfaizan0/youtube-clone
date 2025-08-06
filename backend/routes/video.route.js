import { Router } from "express";
import { addComment, allVideos, deleteComment, deleteVideo, editVideo, playVideo, searchVideo, toggleLikeDislike, updateComment, uploadVideo } from "../controllers/video.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { uploadThumbnail } from "../config/cloudinary.js";
import { validateVideoCRUD } from "../middleware/video.middleware.js";

const videoRouter = Router()

videoRouter.post("/upload", protect, uploadThumbnail.single("thumbnail"), uploadVideo)
videoRouter.get("/all", allVideos)
videoRouter.get("/watch/:videoId", playVideo)
videoRouter.get("/search", searchVideo)
videoRouter.post("/comment/:videoId", protect, addComment)
videoRouter.put("/comment/:videoId/:commentId", protect, updateComment)
videoRouter.delete("/comment/:videoId/:commentId", protect, deleteComment)
videoRouter.put("/update/:channelId/:videoId", protect, validateVideoCRUD, uploadThumbnail.single("thumbnail"), editVideo)
videoRouter.delete("/update/:channelId/:videoId", protect, validateVideoCRUD, deleteVideo)
videoRouter.put("/react/:videoId", protect, toggleLikeDislike)


export default videoRouter