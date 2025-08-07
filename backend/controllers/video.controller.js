import { cloudinary } from "../config/cloudinary.js";
import Channel from "../models/Channel.model.js";
import Video from "../models/Video.model.js"
import { getVideoDurationInSeconds } from "get-video-duration"

function formatTags(tags) {
    return typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags
}

export async function uploadVideo(req, res) {
    const { title, videoUrl, description, tags } = req.body
    const { path: thumbnailUrl, filename: thumbnailPublicId } = req.file;

    if (!req.file) {
        return res.status(400).json({ message: "Thumbnail image is required." });
    }

    if (!title || !videoUrl) {
        return res.status(400).json({ message: "Please enter the required fields." })
    }

    try {
        const duration = await getVideoDurationInSeconds(videoUrl)
        const channel = await Channel.findOne({ owner: req.user._id }).populate("videos", "views");

        if (!channel) {
            return res.status(400).json({ message: "Please create a channel first" })
        }

        const video = await Video.create({
            title,
            videoUrl,
            thumbnailUrl,
            thumbnailPublicId,
            description,
            tags: formatTags(tags),
            uploader: req.user._id,
            duration: Math.round(duration),
            channel: channel._id
        })

        channel.videos.push(video._id)
        await channel.save()
        await video.populate("channel")

        const totalViews = channel.videos.reduce((acc, video) => acc + video.views, 0)
        const subscriberCount = channel.subscriberCount;

        if (subscriberCount >= 100 || totalViews >= 5000) {
            channel.verified = true;
            await channel.save();
        }

        return res.status(201).json({
            message: "Video uploaded successfully",
            video,
            channelVerified: channel.verified
        })

    } catch (error) {
        return res.status(500).json({
            message: "Server error while uploading the video",
            error: error.message
        })
    }
}

export async function editVideo(req, res) {
    const { videoId } = req.params
    const { title, description, tags } = req.body
    const thumbnailUrl = req.file?.path

    if (!title && !description && !tags && !thumbnailUrl) {
        return res.status(400).json({ message: "Atleast one of the fields among Title, Description, Tags or Thumbnail is required" })
    }

    const updates = {}
    try {
        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(404).json({ message: "Unable to update as video not found" });
        }
        if (req.file) {
            if (video.thumbnailPublicId) {
                await cloudinary.uploader.destroy(video.thumbnailPublicId)
            }
            updates.thumbnailUrl = req.file.path
            updates.thumbnailPublicId = req.file.filename
        }

        if (title) updates.title = title
        if (description) updates.description = description
        if (tags !== undefined) updates.tags = formatTags(tags)

        const updatedVideo = await Video.findByIdAndUpdate(videoId, { $set: updates }, { new: true })
        return res.status(200).json({ message: `${updatedVideo.title} updated successfully`, video: updatedVideo })
    } catch (error) {
        return res.status(500).json({ message: "Server error while updating the video details", error: error.message })
    }
}

export async function deleteVideo(req, res) {
    const { channelId, videoId } = req.params

    try {
        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(404).json({ message: "Unable to delete as video not found" });
        }

        if (video.thumbnailPublicId) {
            await cloudinary.uploader.destroy(video.thumbnailPublicId)
        }
        const deletedVideo = await Video.findByIdAndDelete(videoId)
        const channel = await Channel.findById(channelId)
        if (channel?.videos) {
            channel.videos = channel.videos.filter(vidId => vidId.toString() !== videoId.toString())
            await channel.save()
        }
        return res.status(200).json({ message: "Deleted the video successfully", video: deletedVideo })
    } catch (error) {
        return res.status(500).json({ message: "Server error while updating the video details", error: error.message })
    }
}

export async function allVideos(req, res) {
    try {
        const videos = await Video.find().populate("channel", "channelName verified channelAvatar").limit(40).sort({ createdAt: -1 }).populate("comments.user", "username avatar")
        return res.status(200).json({ message: "Fetched all videos successfully", videos })
    } catch (error) {
        return res.status(500).json({ message: "Server error while loading the videos", error: error.message })
    }
}

export async function playVideo(req, res) {
    const { videoId } = req.params
    try {
        const video = await Video.findById(videoId)
            .populate("uploader", "username avatar")
            .populate("comments.user", "username avatar")
            .populate("channel", "subscriberCount channelName channelAvatar verified subscribers")
        if (!video) {
            return res.status(404).json({ message: "Video not found" })
        }
        video.views += 1
        await video.save()
        return res.status(200).json({ message: "Fetched video successfully", video, videoViews: video.views })
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

export async function addComment(req, res) {
    const { videoId } = req.params
    const userId = req.user._id
    const { comment } = req.body

    if (!comment) {
        return res.status(400).json({ message: "Unable to add empty comment" })
    }

    try {
        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(404).json({ message: "Unable to find the video" })
        }
        video.comments.push({ user: userId, comment })
        await video.save()
        await video.populate("comments.user", "username avatar")
        return res.status(201).json({ message: "Comment added", comments: video.comments })
    } catch (error) {
        return res.status(500).json({ message: "Server error while adding comment", error: error.message })
    }
}

export async function updateComment(req, res) {
    const { videoId, commentId } = req.params
    const userId = req.user._id
    const { updatedComment } = req.body

    if (!updatedComment) {
        return res.status(400).json({ message: "Unable to update empty comment" })
    }

    try {
        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(404).json({ message: "Unable to find the video" })
        }
        const comment = video.comments.find(comm => comm._id.toString() === commentId?.toString())
        if (!comment) {
            return res.status(404).json({ message: "Unable to edit as comment not found" })
        }
        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to modify this comment" });
        }
        comment.comment = updatedComment
        comment.edited = true
        await video.save()
        await video.populate("comments.user", "username avatar")
        return res.status(200).json({ message: "Comment updated", edited: true, comments: video.comments })
    } catch (error) {
        return res.status(500).json({ message: "Server error while updating comment", error: error.message })
    }
}

export async function deleteComment(req, res) {
    const { videoId, commentId } = req.params
    const userId = req.user._id

    try {
        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(404).json({ message: "Unable to find the video" })
        }
        const comment = video.comments.find(comm => comm._id.toString() === commentId?.toString())
        if (!comment) {
            return res.status(404).json({ message: "Unable to edit as comment not found" })
        }
        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to modify this comment" });
        }
        video.comments = video.comments.filter(comm => comm._id.toString() !== commentId?.toString())
        await video.save()
        await video.populate("comments.user", "username avatar")
        return res.status(200).json({ message: "Comment deleted successfully", comments: video.comments })
    } catch (error) {
        return res.status(500).json({ message: "Server error while deleting comment", error: error.message })
    }
}

export async function toggleLikeDislike(req, res) {
    const { videoId } = req.params
    const userId = req.user._id
    const { action } = req.body

    try {
        const video = await Video.findById(videoId)

        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        // Like
        if (action === "like") {
            if (video.likedBy.some(id => id.equals(userId))) {
                video.likedBy = video.likedBy.filter(id => !id.equals(userId))
                video.likes -= 1
            } else if (video.dislikedBy.some(id => id.equals(userId))) {
                video.dislikedBy = video.dislikedBy.filter(id => !id.equals(userId))
                video.likedBy.push(userId)
                video.dislikes -= 1
                video.likes += 1
            } else {
                video.likedBy.push(userId)
                video.likes += 1
            }
        }

        // Dislike
        if (action === "dislike") {
            if (video.dislikedBy.some(id => id.equals(userId))) {
                video.dislikedBy = video.dislikedBy.filter(id => !id.equals(userId))
                video.dislikes -= 1
            } else if (video.likedBy.some(id => id.equals(userId))) {
                video.likedBy = video.likedBy.filter(id => !id.equals(userId))
                video.dislikedBy.push(userId)
                video.likes -= 1
                video.dislikes += 1
            } else {
                video.dislikedBy.push(userId)
                video.dislikes += 1
            }
        }

        await video.save()

        return res.status(200).json({ message: `${action} action updated successfully`, likes: video.likes, dislikes: video.dislikes })
    } catch (error) {
        return res.status(500).json({ message: `Server error while implementing ${action} action`, error: error.message })
    }
}