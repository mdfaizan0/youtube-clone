import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    avatar: {
        type: String
    },
    channels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel"
    }],
    consent: {
        type: Boolean,
        required: true
    }
}, { timestamps: true })

const User = mongoose.model("User", userSchema)

export default User