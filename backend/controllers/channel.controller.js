import User from "../models/User.model.js"
import Channel from "../models/Channel.model.js"
import Video from "../models/Video.model.js"
import { cloudinary } from "../config/cloudinary.js"

// // controller to handle channel creation with default avatar and banner
export async function createChannel(req, res) {
    const { channelName, channelAvatar, channelDescription } = req.body
    const owner = req.user._id
    let channelBanner = null
    let channelBannerPublicId = null

    // checking if banner came with response
    if (req.file) {
        channelBanner = req.file.path
        channelBannerPublicId = req.file.filename
    }

    // checking only if channel name is in response, else everything can be default
    if (!channelName) {
        return res.status(400).json({ message: "Channel Name is required" })
    }

    // checking if user has a channel, if yes, return 409 and then after adding to db, sending the response
    try {
        const channelExist = await Channel.findOne({ owner })
        if (channelExist) {
            return res.status(409).json({ message: "A channel already exists", channel: channelExist })
        }

        const newChannel = await Channel.create({
            channelName,
            channelAvatar: channelAvatar || "https://i.pinimg.com/474x/e5/63/46/e56346cf2916063035418d1ee9a7c5ad.jpg",
            channelDescription,
            channelBanner: channelBanner || "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/1a989815-8731-4b08-8124-db03acb4ada8/di7xmh0-8c21639f-8b54-4c3b-bed0-b50b6fbc8d8b.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzFhOTg5ODE1LTg3MzEtNGIwOC04MTI0LWRiMDNhY2I0YWRhOFwvZGk3eG1oMC04YzIxNjM5Zi04YjU0LTRjM2ItYmVkMC1iNTBiNmZiYzhkOGIucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.FdXzqcYPmKrGo-kOef_Na2ovW9QoA5FfoOyh2ykoNmo",
            owner,
            channelBannerPublicId
        })
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

// controller to handle finding a channel by ID and sending them for public view
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

// controller to handle finding a channel by ID and sending them for manage view
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

// controller to handle updating details of a channel
export async function updateChannel(req, res) {
    const { channelName, channelAvatar, channelDescription } = req.body
    const owner = req.user._id
    const channelBanner = req?.file?.path

    // checking if anyone of them is received, if not, send bad response
    if (!channelName && !channelAvatar && !channelDescription && !channelBanner) {
        return res.status(400).json({ message: "Atleast one of the fields among Channel Name, Channel Avatar, Channel Description or Channel Banner is required" })
    }

    // initializing updates object
    let updates = {}
    // finding if channel exist, if not, 404
    try {
        const channelExist = await Channel.findOne({ owner })
        if (!channelExist) {
            return res.status(404).json({ message: "Not found the channel to update", notFound: true })
        }
        
        // checking if channel banner came thru, if yes, remove the old one from cloudinary and then upload the new file and its public ID to cloud
        if (req.file) {
            if (channelExist.channelBannerPublicId) {
                await cloudinary.uploader.destroy(channelExist.channelBannerPublicId)
            }
            updates.channelBanner = req.file.path
            updates.channelBannerPublicId = req.file.filename
        }

        // adding rest of the details of updates obj, if they exist
        if (channelName) updates.channelName = channelName
        if (channelAvatar) updates.channelAvatar = channelAvatar
        if (channelDescription) updates.channelDescription = channelDescription

        // sending update to DB, checking if channel exist (again for safety) and then the response with updated channel details
        const channel = await Channel.findOneAndUpdate({ owner }, updates, { new: true })
        if (!channel) return res.status(404).json({ message: "Unable to update details as channel not found", notFound: true })
        return res.status(200).json({ message: `Channel with ID: ${channel._id} is updated.`, updatedDetails: await Channel.findOne({ owner }).populate("owner", "username avatar").populate("videos") })
    } catch (error) {
        return res.status(500).json({ message: "Server error while updating channel details", error: error.message })
    }
}

// controller to handle removing a channel after auth and necessary checks and removing the banner from db too
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

        // removing channel ref from channels array from User model
        if (user?.channels) {
            user.channels = user.channels.filter(chan => chan.toString() !== channel._id.toString())
            await user.save()
        }

        // handling deletion of the videos, followed by the channel and then sending a custom response
        const videos = await Video.deleteMany({ channel: channel._id })
        await Channel.deleteOne(channel._id)
        return res.status(200).json(
            { message: `${channel.channelName} channel deleted successfully ${videos.deletedCount > 0 ? `along with ${videos.deletedCount} video${videos.deletedCount > 1 ? "s" : ""}` : ""}`, deletedChannel: channel })
    } catch (error) {
        return res.status(500).json({ message: "Server error while deleting the channel", error: error.message })
    }
}

// controller to handle subscriber toggle in sync with DB after auth based on action property received from FE
export async function toggleSubscriber(req, res) {
    const { action } = req.body
    const userId = req.user._id
    const { channelId } = req.params

    try {
        // checking if channel exist
        const channel = await Channel.findById(channelId)
        if (!channel) {
            return res.status(404).json({ message: "Channel not found" })
        }

        // checking if action is increase, if yes, checking if the channel has the user as sub, if yes, cannot subscribe again, else, add the user to sub array in Channel model
        if (action === "inc") {
            if (channel.subscribers.some(id => id.equals(userId))) {
                return res.status(400).json({ message: "Already subscribed, cannot subscribe again" })
            }
            channel.subscribers.push(userId)
            channel.subscriberCount += 1
        }
        
        // checking if action is decrease, if yes, checking if the channel has the user as sub, if yes, add the user to sub array in Channel model, else, cannot subscribe again
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