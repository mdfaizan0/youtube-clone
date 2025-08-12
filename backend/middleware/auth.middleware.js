import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import User from "../models/User.model.js"

dotenv.config()

// middleware to handle user auth and check if token exist, if not, send necessary response
export async function protect(req, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" })
    }

    try {
        const token = authHeader.split(" ")[1]
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Invalid token", error: err.message })
            }
            const user = await User.findById(decoded.id)

            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }
            req.user = user
            next()
        })
    } catch (error) {
        return res.status(500).json({ message: "Server error while verifying token", error: error.message })
    }
}