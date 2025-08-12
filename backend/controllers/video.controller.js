import { cloudinary } from "../config/cloudinary.js";
import Channel from "../models/Channel.model.js";
import Video from "../models/Video.model.js"
import { getVideoDurationInSeconds } from "get-video-duration"

// utlity function to format tags
function formatTags(tags) {
    if (typeof tags !== 'string') return tags;
    return tags.split(/[,\s]+/)
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
}

// controller to handle uploading of a video
export async function uploadVideo(req, res) {
    const { title, videoUrl, description, tags, category } = req.body
    const { path: thumbnailUrl, filename: thumbnailPublicId } = req?.file;

    // checking if thumbnail image came from FE
    if (!req.file) {
        return res.status(400).json({ message: "Thumbnail image is required." });
    }

    // checking if title and videoURL came thru
    if (!title || !videoUrl) {
        return res.status(400).json({ message: "Please enter the required fields." })
    }

    try {
        // finding duration with get-video-duration pkg and finding the user
        const duration = await getVideoDurationInSeconds(videoUrl)
        const userChannel = await Channel.findOne({ owner: req.user._id })

        // channel exists? if not, create one first to upload a video
        if (!userChannel) {
            return res.status(400).json({ message: "Please create a channel first" })
        }

        // formatting category
        const normalizedCategory = category
            ? category.trim().charAt(0).toUpperCase() + category.trim().slice(1).toLowerCase()
            : "Uncategorized";

        // adding details to db
        const video = await Video.create({
            title,
            videoUrl,
            thumbnailUrl,
            thumbnailPublicId,
            category: normalizedCategory,
            description: description || "No description available",
            tags: formatTags(tags),
            uploader: req.user._id,
            duration: Math.round(duration),
            channel: userChannel._id
        })

        // adding video ref to user model
        userChannel.videos.push(video._id)
        await userChannel.save()
        await video.populate("channel")

        // calculating view and the subsCount
        const totalViews = userChannel.videos.reduce((acc, video) => acc + video.views, 0)
        const subscriberCount = userChannel.subscriberCount;

        // giving them verified badge automaticallt if the subsCount is more than 100 and total video is more than 5000, this will happen only when they upload a video
        if (subscriberCount >= 100 || totalViews >= 5000) {
            userChannel.verified = true;
            await userChannel.save();
        }

        // finding channel to send as response
        const channel = await Channel.findById(userChannel._id).populate("owner", "username avatar").populate("videos")

        return res.status(201).json({
            message: "Video uploaded successfully",
            channel
        })

    } catch (error) {
        return res.status(500).json({
            message: "Server error while uploading the video",
            error: error.message,
        })
    }
}

// controller to handle editing a video details
export async function editVideo(req, res) {
    const { channelId, videoId } = req.params
    const { title, description, tags, category } = req.body
    const thumbnailUrl = req.file?.path

    // checking if any one of them came thru
    if (!title && !description && !tags && !thumbnailUrl) {
        return res.status(400).json({ message: "Atleast one of the fields among Title, Description, Tags or Thumbnail is required" })
    }

    // initializing updates object
    const updates = {}
    try {
        // checking if video exist
        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(404).json({ message: "Unable to update as video not found" });
        }

        // checking if thumbnail came thru, if yes, remove the old one from cloudinary and then upload the new file and its public ID to cloud
        if (req.file) {
            if (video.thumbnailPublicId) {
                await cloudinary.uploader.destroy(video.thumbnailPublicId)
            }
            updates.thumbnailUrl = req.file.path
            updates.thumbnailPublicId = req.file.filename
        }

        // adding rest of the details of updates obj, if they exist after formatting category
        if (title) updates.title = title
        if (description) updates.description = description
        if (tags !== undefined) updates.tags = formatTags(tags)
        if (category) {
            updates.category = category.trim().charAt(0).toUpperCase() + category.trim().slice(1).toLowerCase();
        }

        // sending the update to DB, finding channel and sending as response
        const updatedVideo = await Video.findByIdAndUpdate(videoId, { $set: updates }, { new: true })
        const channel = await Channel.findById(channelId).populate("owner", "username avatar").populate("videos")
        return res.status(200).json({ message: `${updatedVideo.title} updated successfully`, channel })
    } catch (error) {
        return res.status(500).json({ message: "Server error while updating the video details", error: error.message })
    }
}

// controller to handle deletion of a video
export async function deleteVideo(req, res) {
    const { channelId, videoId } = req.params


    try {
        // finding video and deleting
        const video = await Video.findByIdAndDelete(videoId)
        // if video do not exist, send 404
        if (!video) {
            return res.status(404).json({ message: "Unable to delete as video not found" });
        }

        // remove the thumbnail from cloud
        if (video.thumbnailPublicId) {
            await cloudinary.uploader.destroy(video.thumbnailPublicId)
        }

        // finding channel and removing video refs
        const channel = await Channel.findById(channelId)
        if (channel?.videos) {
            channel.videos = channel.videos.filter(vidId => vidId.toString() !== videoId.toString())
            await channel.save()
        }

        // finding updated details of the channel and sending as a response
        const newChannel = await Channel.findById(channelId).populate("owner", "username avatar").populate("videos")
        return res.status(200).json({ message: "Deleted the video successfully", channel: newChannel })
    } catch (error) {
        return res.status(500).json({ message: "Server error while updating the video details", error: error.message })
    }
}

// controller to handle finding all videos from Video model and sending them to FE for feed
export async function allVideos(req, res) {
    try {
        const videos = await Video.find().populate("channel", "channelName verified channelAvatar").limit(40).sort({ createdAt: -1 }).populate("comments.user", "username avatar")
        return res.status(200).json({ message: "Fetched all videos successfully", videos })
    } catch (error) {
        return res.status(500).json({ message: "Server error while loading the videos", error: error.message })
    }
}

// controller to handle find specific video using videoId from params
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

// controller to handle searching for a video by their tags/title
export async function searchVideo(req, res) {
    const query = req.query.q?.trim()

    // if query doesn't exist, send 404
    if (!query) {
        return res.status(400).json({ message: "Search query is required." })
    }

    // finding video based on query, options: "i" to make case-matching insensitive and then sorting the result
    try {
        const videos = await Video.find({
            $or: [
                { title: { $regex: query, $options: "i" } },
                { tags: { $in: [query.toLowerCase()] } }
            ]
        }).limit(20).sort({ createdAt: -1 }).populate("channel")

        // checking if there are no videos, send 404
        if (videos.length === 0) {
            return res.status(404).json({ message: "No results found" })
        }

        return res.status(200).json({ message: "Searched videos successfully", videos })
    } catch (error) {
        return res.status(500).json({ message: "Server error while searching the videos", error: error.message })
    }
}

// controller to handle adding a comment
export async function addComment(req, res) {
    const { videoId } = req.params
    const userId = req.user._id
    const { comment } = req.body

    // if comment edoesn't exist, send 400
    if (!comment) {
        return res.status(400).json({ message: "Unable to add empty comment" })
    }

    try {
        // find video by ID received in params
        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(404).json({ message: "Unable to find the video" })
        }
        // adding comment to video.comments with Comment schema, saving video and sending 201
        video.comments.push({ user: userId, comment })
        await video.save()
        await video.populate("comments.user", "username avatar")
        return res.status(201).json({ message: "Comment added", comments: video.comments })
    } catch (error) {
        return res.status(500).json({ message: "Server error while adding comment", error: error.message })
    }
}

// controller to handle updating of a comment
export async function updateComment(req, res) {
    const { videoId, commentId } = req.params
    const userId = req.user._id
    const { updatedComment } = req.body

    // checking if updated comment came thru, if not, send 400
    if (!updatedComment) {
        return res.status(400).json({ message: "Unable to update empty comment" })
    }

    try {
        // find the video
        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(404).json({ message: "Unable to find the video" })
        }

        // find the comment with commentID
        const comment = video.comments.find(comm => comm._id.toString() === commentId?.toString())
        // if not comment, send 404
        if (!comment) {
            return res.status(404).json({ message: "Unable to edit as comment not found" })
        }

        // if commenter ID is not same as userId, send unauthorized
        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to modify this comment" });
        }
        // else, add details with edited flag and save video, then send 200
        comment.comment = updatedComment
        comment.edited = true
        await video.save()
        await video.populate("comments.user", "username avatar")
        return res.status(200).json({ message: "Comment updated", edited: true, comments: video.comments })
    } catch (error) {
        return res.status(500).json({ message: "Server error while updating comment", error: error.message })
    }
}

// controller to handle deleting a comment
export async function deleteComment(req, res) {
    const { videoId, commentId } = req.params
    const userId = req.user._id

    try {
        // finding video by Id
        const video = await Video.findById(videoId)
        // checking if video exist
        if (!video) {
            return res.status(404).json({ message: "Unable to find the video" })
        }
        // again, checking if comment exist
        const comment = video.comments.find(comm => comm._id.toString() === commentId?.toString())
        // if not, send 404
        if (!comment) {
            return res.status(404).json({ message: "Unable to edit as comment not found" })
        }
        // checking for authorization
        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to modify this comment" });
        }
        // removing the comment from video.comments, saving video and sending 200
        video.comments = video.comments.filter(comm => comm._id.toString() !== commentId?.toString())
        await video.save()
        await video.populate("comments.user", "username avatar")
        return res.status(200).json({ message: "Comment deleted successfully", comments: video.comments })
    } catch (error) {
        return res.status(500).json({ message: "Server error while deleting comment", error: error.message })
    }
}

// controller to handle toggling like/dislike based on action
export async function toggleLikeDislike(req, res) {
    const { videoId } = req.params
    const userId = req.user._id
    const { action } = req.body

    try {
        // finding video
        const video = await Video.findById(videoId)

        // if not, send 404
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        /**
         * like;
         * checking if action is like
         * if yes, checking likedBy has the userId,
         * if yes, remove the the user ref and decrement likes count
         * otherwise, checking if user is in dislikedBy
         * if yes, remove them from dislikedBy, add them likedBy, increment likes count and decrement dislikes count
         * if both condition does not meet, user is the first like liker, add them to likedBy and increment the likes count
         */
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

        /**
         * dislike;
         * checking if action is dislike
         * if yes, checking disliked has the userId,
         * if yes, remove the the user ref and decrement dislikes count
         * otherwise, checking if user is in likedBy
         * if yes, remove them from likedBy, add them dislikedBy, increment dislikes count and decrement likes count
         * if both condition does not meet, user is the first like disliker, add them to dislikedBy and increment the dislikes count
         */
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

        // saving and sending response
        await video.save()

        return res.status(200).json({ message: `${action} action updated successfully`, likes: video.likes, dislikes: video.dislikes })
    } catch (error) {
        return res.status(500).json({ message: `Server error while implementing ${action} action`, error: error.message })
    }
}