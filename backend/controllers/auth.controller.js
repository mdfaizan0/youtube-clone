import User from "../models/User.model.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"

dotenv.config()

export async function signUpUser(req, res) {
    const { name, username, email, password, avatar, consent } = req.body
    if (!name || !username || !email || !password) {
        return res.status(400).json({ message: "Please enter the required fields." })
    }

    try {
        const userExists = await User.findOne({ email })
        if (userExists) return res.status(409).json({ message: "User already exists, please login instead" })

        const hashedPassword = await bcrypt.hash(password, 12)
        const user = await User.create({ name, username, email, password: hashedPassword, avatar: avatar || "https://img.icons8.com/?size=100&id=7819&format=png&color=FFFFFF", consent })

        return res.status(201).json({
            message: `User ${user.name} registered successfully`,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                consent,
                avatar
            }
        })
    } catch (error) {
        return res.status(500).json({ message: "Server error while registering the user", error: error.message })
    }
}

export async function signInUser(req, res) {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: "Please enter the required fields." })
    }

    try {
        let user = await User.findOne({ email }).select("+password")
        if (!user) return res.status(404).json({ message: "Unable to find the user, please check your credentials or Sign Up" })

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) return res.status(401).json({ message: "Unable to verify the user, please check your password" })

        const userObj = user.toObject()
        delete userObj.password

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" })
        return res.status(200).json({ message: "User authorized", token, isMatch, user: userObj })
    } catch (error) {
        return res.status(500).json({ message: "Server error while signing in", error: error.message })
    }
}

export async function userProfile(req, res) {
    try {
        return res.status(200).json({ message: "User profile fetched", user: req.user })
    } catch (error) {
        return res.status(500).json({ message: "Server error while getting user profile", error: error.message })
    }
}