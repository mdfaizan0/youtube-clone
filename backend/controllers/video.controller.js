import Video from "../models/Video.model.js"

export async function uploadVideo(req, res) {
    const { title, videoUrl, duration, description, tags } = req.body
    const thumbnailUrl = req.file?.path;

    if (!req.file) {
        return res.status(400).json({ message: "Thumbnail image is required." });
    }

    if (!title || !videoUrl || !duration) {
        return res.status(400).json({ message: "Please enter the required fields." })
    }

    try {
        const video = await Video.create({
            title,
            videoUrl,
            thumbnailUrl,
            description,
            tags: typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags,
            uploader: req.user._id,
            duration
        })
        return res.status(201).json({ message: "Uploaded video successfully", video })
    } catch (error) {
        return res.status(500).json({ message: "Server error while uploading the video", error: error.message })
    }
}

export async function allVideos(req, res) {
    try {
        const videos = await Video.find().populate("uploader", "username avatar").limit(40).sort({ createdAt: -1 })
        return res.status(200).json({ message: "Fetched all videos successfully", videos })
    } catch (error) {
        return res.status(500).json({ message: "Server error while loading the videos", error: error.message })
    }
}

export async function oneVideo(req, res) {
    const videoId = req.params.id
    try {
        const video = await Video.findById(videoId).populate("uploader", "username avatar")
        if (!video) {
            return res.status(404).json({ message: "Video not found" })
        }

        return res.status(200).json({ message: "Fetched video successfully", video })
    } catch (error) {
        return res.status(500).json({ message: "Server error while loading the video", error: error.message })
    }
}

export async function channelVideos(req, res) {
    const userId = req.params.userId
    try {
        const videos = await Video.find({ uploader: userId }).sort({ createdAt: -1 })
        return res.status(200).json({ message: "Fetched channel videos successfully", videos })
    } catch (error) {
        return res.status(500).json({ message: "Server error while loading channel videos", error: error.message })
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