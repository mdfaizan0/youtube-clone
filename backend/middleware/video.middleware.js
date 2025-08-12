import Video from "../models/Video.model.js";
import Channel from "../models/Channel.model.js";

// middleware to handle validating if the video's CRUD operation is valid
export async function validateVideoCRUD(req, res, next) {
    const { channelId, videoId } = req.params
    const userId = req.user._id

    try {
        // finding if channel exist
        const channel = await Channel.findById(channelId)
        // if not, send 404
        if (!channel) {
            return res.status(404).json({ message: "Unable to edit the video as channel not found" })
        }
        // finding the video
        const video = await Video.findById(videoId)
        // if not, send 404
        if (!video) {
            return res.status(404).json({ message: "Unable to find the video to edit" })
        }

        // checking if the requester is the channel owner, if not, sending 403
        if (channel.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to edit this video, as you do not own this channel" })
        }

        // checking if video exist in this channel, if not, sending 404
        if (!channel.videos.some(id => id.toString() === videoId.toString())) {
            return res.status(404).json({ message: "Unable to find the video in this channel" })
        }
        next()
    } catch (error) {
        return res.status(500).json({ message: "Server error while validating CRUD operation on video", error: error.message })
    }
}