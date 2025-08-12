import mongoose from "mongoose";

// user schema with some fields as required
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

// making model and exporting
const User = mongoose.model("User", userSchema)

export default User