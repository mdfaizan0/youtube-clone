import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import cors from "cors"

dotenv.config()
connectDB()

const app = express()

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`App is running on http://localhost:${PORT}`)
})

app.get("/", (req, res) => {
    res.send("Youtube backend is live!")
})