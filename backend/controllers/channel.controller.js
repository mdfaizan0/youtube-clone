import User from "../models/User.model.js"
import Channel from "../models/Channel.model.js"
import Video from "../models/Video.model.js"
import { cloudinary } from "../config/cloudinary.js"

export async function createChannel(req, res) {
    const { channelName, channelAvatar, channelDescription } = req.body
    const owner = req.user._id
    const { path: channelBanner, filename: channelBannerPublicId } = req.file

    if (!channelName) {
        return res.status(400).json({ message: "Channel Name is required" })
    }

    try {
        const channelExist = await Channel.findOne({ owner })
        if (channelExist) {
            return res.status(409).json({ message: "A channel already exists", channel: channelExist })
        }

        const newChannel = await Channel.create({ channelName, channelAvatar, channelDescription, channelBanner, owner, channelBannerPublicId })
        await newChannel.populate("owner", "username avatar")
        const user = await User.findById(owner)
        if (user) {
            user.channels.push(newChannel._id)
            await user.save()
        }
        return res.status(201).json({ message: "New Channel created", channel: newChannel })
    } catch (error) {
        return res.status(500).json({ message: "Server error while creating channel", error: error.message })
    }
}

export async function getChannelById(req, res) {
    const { channelId } = req.params

    try {
        const channel = await Channel.findById(channelId).populate("owner", "username avatar").populate("videos")
        if (!channel) {
            return res.status(404).json({ message: "Channel not found", notFound: true })
        }
        return res.status(200).json({ message: "Channel fetched", channel })
    } catch (error) {
        return res.status(500).json({ message: "Server error while fetching channel details", error: error.message })
    }
}

export async function getMyChannel(req, res) {
    const owner = req.user._id

    try {
        const channel = await Channel.findOne({ owner }).populate("owner", "username avatar").populate("videos")
        if (!channel) return res.status(404).json({ message: "Channel not found", notFound: true })
        return res.status(200).json({ message: "User channel fetched successfully", channel })
    } catch (error) {
        return res.status(500).json({ message: "Server error while fetching user's channel details", error: error.message })
    }
}

export async function updateChannel(req, res) {
    const { channelName, channelAvatar, channelDescription } = req.body
    const owner = req.user._id

    if (!channelName && !channelAvatar && !channelDescription && !channelBanner) {
        return res.status(400).json({ message: "Atleast one of the fields among Channel Name, Channel Avatar, Channel Description or Channel Banner is required" })
    }

    let updates = {}
    try {
        const channelExist = await Channel.findOne({ owner })
        if (!channelExist) {
            return res.status(404).json({ message: "Not found the channel to update", notFound: true })
        }
        if (req.file) {
            if (channelExist.channelBannerPublicId) {
                await cloudinary.uploader.destroy(channelExist.channelBannerPublicId)
            }
            updates.channelBanner = req.file.path
            updates.channelBannerPublicId = req.file.filename
        }

        if (channelName) updates.channelName = channelName
        if (channelAvatar) updates.channelAvatar = channelAvatar
        if (channelDescription) updates.channelDescription = channelDescription

        const channel = await Channel.findOneAndUpdate({ owner }, updates, { new: true })
        if (!channel) return res.status(404).json({ message: "Unable to update details as channel not found", notFound: true })
        return res.status(200).json({ message: `Channel with ID: ${channel._id} is updated.`, updatedDetails: await Channel.findOne({ owner }) })
    } catch (error) {
        return res.status(500).json({ message: "Server error while updating channel details", error: error.message })
    }
}

export async function deleteChannel(req, res) {
    const userId = req.user._id

    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const channel = await Channel.findOne({ owner: userId })
        if (!channel) {
            return res.status(404).json({ message: "Unable to delete as channel not found", notFound: true })
        }

        if (channel.channelBannerPublicId) {
            await cloudinary.uploader.destroy(channel.channelBannerPublicId)
        }

        if (user?.channels) {
            user.channels = user.channels.filter(chan => chan.toString() !== channel._id.toString())
            await user.save()
        }
        const videos = await Video.deleteMany({ channel: channel._id })
        await Channel.deleteOne(channel._id)
        return res.status(200).json({ message: `${channel.channelName} channel deleted successfully ${videos.deletedCount > 0 ? `along with ${videos.deletedCount} videos` : ""}`, deletedChannel: channel })
    } catch (error) {
        return res.status(500).json({ message: "Server error while deleting the channel", error: error.message })
    }
}

export async function toggleSubscriber(req, res) {
    const { action } = req.body
    const userId = req.user._id
    const { channelId } = req.params

    try {
        const channel = await Channel.findById(channelId)
        if (!channel) {
            return res.status(404).json({ message: "Channel not found" })
        }
        if (action === "inc") {
            if (channel.subscribers.some(id => id.equals(userId))) {
                return res.status(400).json({ message: "Already subscribed, cannot subscribe again" })
            }
            channel.subscribers.push(userId)
            channel.subscriberCount += 1
        }

        if (action === "dec") {
            if (channel.subscribers.some(id => id.equals(userId))) {
                channel.subscribers = channel.subscribers.filter(sub => !sub.equals(userId))
                channel.subscriberCount -= 1
            } else {
                return res.status(400).json({ message: "You are not subscribed to this channel" })
            }
        }

        await channel.save()
        return res.status(200).json({ message: `Subscriber count updated successfully`, subscribers: channel.subscribers, subscriberCount: channel.subscriberCount })
    } catch (error) {
        return res.status(500).json({ message: "Server error while updating subscriber count", error: error.message })
    }
}