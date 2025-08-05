import Channel from "../models/Channel.model.js";
import Video from "../models/Video.model.js"
import { getVideoDurationInSeconds } from "get-video-duration"

export async function uploadVideo(req, res) {
    const { title, videoUrl, duration, description, tags } = req.body
    const thumbnailUrl = req.file?.path;

    if (!req.file) {
        return res.status(400).json({ message: "Thumbnail image is required." });
    }

    if (!title || !videoUrl ) {
        return res.status(400).json({ message: "Please enter the required fields." })
    }

    try {
        const duration = await getVideoDurationInSeconds(videoUrl)
        const channel = await Channel.findOne({ owner: req.user._id })
        if (!channel) {
            return res.status(400).json({ message: "Please create a channel first" })
        }
        const video = await Video.create({
            title,
            videoUrl,
            thumbnailUrl,
            description,
            tags: typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags,
            uploader: req.user._id,
            duration: Math.round(duration),
            channel: channel._id
        })
        if (video) {
            channel.videos.push(video._id)
            await channel.save()
        }
        return res.status(201).json({ message: "Video uploaded successfully", video })
    } catch (error) {
        return res.status(500).json({ message: "Server error while uploading the video", error: error.message })
    }
}

export async function allVideos(req, res) {
    try {
        const videos = await Video.find().populate("uploader", "username avatar").limit(40).sort({ createdAt: -1 }).populate("comments.user", "username avatar")
        return res.status(200).json({ message: "Fetched all videos successfully", videos })
    } catch (error) {
        return res.status(500).json({ message: "Server error while loading the videos", error: error.message })
    }
}

export async function oneVideo(req, res) {
    const videoId = req.params.id
    try {
        const video = await Video.findById(videoId).populate("uploader", "username avatar").populate("comments.user", "username avatar")
        if (!video) {
            return res.status(404).json({ message: "Video not found" })
        }

        return res.status(200).json({ message: "Fetched video successfully", video })
    } catch (error) {
        return res.status(500).json({ message: "Server error while loading the video", error: error.message })
    }
}

export async function searchVideo(req, res) {
    const query = req.query.q?.trim()

    if (!query) {
        return res.status(400).json({ message: "Search query is required." })
    }

    try {
        const videos = await Video.find({
            $or: [
                { title: { $regex: query, $options: "i" } },
                { tags: { $in: [query.toLowerCase()] } }
            ]
        }).limit(20).sort({ createdAt: -1 }).populate("uploader", "username avatar")

        if (videos.length === 0) {
            return res.status(404).json({ message: "Unable to find any video" })
        }

        return res.status(200).json({ message: "Searched videos successfully", videos })
    } catch (error) {
        return res.status(500).json({ message: "Server error while searching the videos", error: error.message })
    }
}