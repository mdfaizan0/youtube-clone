import { v2 as cloudinary } from 'cloudinary'
import dotenv from "dotenv"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const thumbnailStorage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
        return {
            folder: "thumbnails",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            public_id: `${Date.now()}-${file.originalname.split(".")[0].replace(/\s+/g, "-")}`,
            transformation: {
                width: 480,
                crop: "scale"
            }
        }
    }
})

const channelBannerStorage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
        return {
            folder: "channelBanner",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            public_id: `${Date.now()}-${file.originalname.split(".")[0].replace(/\s+/g, "-")}`,
            transformation: {
                width: 2560,
                crop: "scale"
            }
        }
    }
})

const uploadThumbnail = multer({ storage: thumbnailStorage })
const uploadChannelBanner = multer({ storage: channelBannerStorage })

export { cloudinary, uploadThumbnail, uploadChannelBanner }