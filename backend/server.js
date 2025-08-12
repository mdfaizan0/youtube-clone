// importing necessary dependencies
import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.route.js"
import channelRouter from "./routes/channel.routes.js"

// configuring dotenv and calling DB to configure
dotenv.config()
connectDB()

// configuring express
const app = express()

// adding necessary mw
// cors for BE ↔ FE comms
// express.json for parsing from JSON to obj
// express.urlencoded for handling form data
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// configuring API routes
app.use("/api/auth", userRouter)
app.use("/api/video", videoRouter)
app.use("/api/channel", channelRouter)

// adding PORT from env or 5000 and testing
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`App is running on http://localhost:${PORT}`)
})

// basic route
app.get("/", (req, res) => {
    res.send("Youtube backend is live!")
})