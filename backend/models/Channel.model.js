import mongoose from "mongoose";

// channel schema with avatar and banner's default value
const channelSchema = mongoose.Schema({
    channelName: {
        type: String,
        required: true
    },
    channelAvatar: {
        type: String,
        default: "https://i.sstatic.net/34AD2.jpg"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true
    },
    videos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }],
    channelDescription: {
        type: String,
        default: "No description available"
    },
    channelBanner: {
        type: String,
        default: "https://dummyimage.com/2560x1440/5e5e5e/ffffff.png&text=YouTube+Banner"
    },
    channelBannerPublicId: {
        type: String
    },
    verified: {
        type: Boolean,
        default: false
    },
    subscribers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    subscriberCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

// making model and exporting
const Channel = mongoose.model("Channel", channelSchema)

export default Channel