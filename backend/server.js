import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.route.js"
import channelRouter from "./routes/channel.routes.js"

dotenv.config()
connectDB()

const app = express()

app.use(cors({
    credentials: process.env.FRONTEND_ORIGIN
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/auth", userRouter)
app.use("/api/video", videoRouter)
app.use("/api/channel", channelRouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`App is running on http://localhost:${PORT}`)
})

app.get("/", (req, res) => {
    res.send("Youtube backend is live!")
})