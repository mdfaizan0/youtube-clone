import Video from "../models/Video.model.js";
import Channel from "../models/Channel.model.js";

export async function validateVideoCRUD(req, res, next) {
    const { channelId, videoId } = req.params
    const userId = req.user._id

    try {
        const channel = await Channel.findById(channelId)
        if (!channel) {
            return res.status(404).json({ message: "Unable to edit the video as channel not found" })
        }
        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(404).json({ message: "Unable to find the video to edit" })
        }

        if (channel.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to edit this video, as you do not own this channel" })
        }

        if (!channel.videos.some(id => id.toString() === videoId.toString())) {
            return res.status(404).json({ message: "Unable to find the video in this channel" })
        }
        next()
    } catch (error) {
        return res.status(500).json({ message: "Server error while validating CRUD operation on video", error: error.message })
    }
}