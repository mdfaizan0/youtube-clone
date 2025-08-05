import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createChannel, deleteChannel, getChannelById, getMyChannel, updateChannel } from "../controllers/channel.controller.js";
import { uploadChannelBanner } from "../config/cloudinary.js";

const channelRouter = Router()

channelRouter.post("/create", protect, uploadChannelBanner.single("channelBanner"), createChannel)
channelRouter.get("/me", protect, getMyChannel)
channelRouter.put("/me", protect, updateChannel)
channelRouter.delete("/me", protect, deleteChannel)
channelRouter.get("/:channelId", getChannelById)

export default channelRouter