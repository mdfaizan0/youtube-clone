import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

// configuring db
async function connectDB() {
    try {
        const connected = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB Connected: ${connected.connection.host}`)
    } catch (error) {
        console.log(`Error connecting DB: ${error.message}`)
    }
}

export default connectDB