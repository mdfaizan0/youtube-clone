import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { CHANNEL_CREATE } from "../utils/API_CONFIG"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { getProfile } from "../utils/authUtils"
import { logout, setUser } from "../utils/userSlice"

const MAX_BANNER_SIZE = 5 * 1024 * 1024;
const MAX_BANNER_SIZE_MB = Math.round(MAX_BANNER_SIZE / 1000000);

function CreateChannel() {
    // delaring states, redux states and getting rrd hooks
    const [channelAvatarURL, setChannelAvatarURL] = useState("")
    const [bannerPreview, setBannerPreview] = useState(null)
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
    const user = useSelector(state => state?.user?.user)
    const token = useSelector(state => state?.user?.token)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    // route protection thru user and token state
    useEffect(() => {
        if (user?.channels.length >= 1) {
            toast("As of now, we only support 1 channel per user, please use your existing channel")
            navigate(`/channel/manage`)
            return
        }

        if (!token) {
            toast.error("Looks like you are not signed in")
            navigate("/login")
            return
        }
    }, [token, user])

    // handling submission of channel creation
    async function onSubmit(data) {
        // setting formData and doing necessary checks for banner
        const formData = new FormData()
        if (data.channelBanner[0]) {
            const allowed_formats = ["jpg", "jpeg", "png", "webp"]
            const fileName = data.channelBanner[0].name.split(".")
            const fileType = fileName[fileName.length - 1].toLowerCase()
            if (!allowed_formats.includes(fileType)) {
                toast.error(`Sorry, but we don't allow ${fileType} filetypes`)
                toast.error("The allowed formats : jpg, jpeg, png, webp")
                return
            }
            if (data.channelBanner[0].size > MAX_BANNER_SIZE) {
                toast.error(`The maximum file size for channel banner is ${MAX_BANNER_SIZE_MB} MB`)
                return
            }
            formData.append("channelBanner", data.channelBanner[0])
        }

        // checking the other values exist and adding them to formData and then sending the data thru formData
        if (data.channelName) formData.append("channelName", data.channelName)
        if (data.channelDescription) formData.append("channelDescription", data.channelDescription)
        if (channelAvatarURL) formData.append("channelAvatar", channelAvatarURL)
        try {
            const res = await fetch(CHANNEL_CREATE, {
                method: "POST",
                headers: {
                    "authorization": `Bearer ${token}`
                },
                body: formData
            })
            const json = await res.json()
            if (res.status === 201) {
                toast.success(json.message)
                navigate(`/channel/manage`)
            } else {
                toast.error(json.message || "Error creating channel")
            }

            const result = await getProfile(token);
            if (result.expired) {
                toast.error("Session Expired, please login again")
                dispatch(logout());
            } else {
                dispatch(setUser(result.user));
            }
        } catch (error) {
            console.error("Error while creating the channel", error)
            toast.error("Error while creating the channel")
        }
    }

    // removing bannerPreview from memory
    useEffect(() => {
        return () => {
            if (bannerPreview) URL.revokeObjectURL(bannerPreview);
        }
    }, [bannerPreview])

    // handling cloudinary upload widget configuring and calling it
    function handleUploadChannelAvatar() {
        const widget = window.cloudinary.createUploadWidget({
            cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
            uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_CHANNEL,
            folder: "channelAvatars",
            sources: ["local"],
            cropping: true,
            croppingAspectRatio: 1,
            croppingDefaultSelectionRatio: 0.8,
            croppingShowDimensions: true,
            croppingCoordinatesMode: "custom",
            multiple: false,
            showSkipCropButton: false,
            croppingShowBackButton: true,
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
            maxFileSize: 3 * 1024 * 1024,
            resourceType: "image",
            showCompletedButton: true,
            showUploadMoreButton: false,
            publicId: user?.username ? `channelAvatar_${user?.username}_${Date.now()}` : `channelAvatar_${Date.now()}`,
            styles: {
                palette: {
                    window: "#1c1c1c",
                    sourceBg: "#222222",
                    windowBorder: "#8E9FBF",
                    tabIcon: "#FFFFFF",
                    inactiveTabIcon: "#8E9FBF",
                    menuIcons: "#CCCCCC",
                    link: "#5ACCFF",
                    action: "#FF620C",
                    inProgress: "#00BFFF",
                    complete: "#20B832",
                    error: "#F44235",
                    textDark: "#000000",
                    textLight: "#FFFFFF",
                }
            }
        }, (error, result) => {
            if (error) {
                console.error("Upload error:", error);
                return;
            }
            // if result is success, setting URL to send to onSubmit
            if (result.event === "success") {
                const url = result.info.secure_url;
                setChannelAvatarURL(url);
                widget.close();
            }
        });

        if (widget) {
            widget.open();
        }
    }

    return (
        <>
            {isSubmitting ? <div className="loading-container"><div className="loading-msg"></div></div> :
                <div className="create-channel-page">
                    <img src="https://img.freepik.com/free-vector/diverse-people-hello-welcome-gesture-multinational-characters-waving-hands-happy-young-man-senior-lady-arab-girl-lgbt-person-positive-greeting-gesturing-line-art-flat-vector-illustration_107791-10896.jpg?t=st=1754602348~exp=1754605948~hmac=e293064757ea4595b12328326c1e570b62b97de2ee52fbf2fe0e9ba7919310ba&w=1480" alt="vector" />
                    <div className="create-channel-form">
                        <h1>Create a new channel</h1>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="avatar-group">
                                <img
                                    src={channelAvatarURL ? channelAvatarURL : "https://img.icons8.com/?size=100&id=tZuAOUGm9AuS&format=png&color=000000"}
                                    alt="Channel Avatar"
                                    className="channel-avatar-preview"
                                    style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", marginTop: "10px" }}
                                />
                                <button type="button" onClick={handleUploadChannelAvatar}>
                                    {channelAvatarURL ? "Change Channel Avatar" : "Upload Channel Avatar"}
                                </button>
                            </div>
                            <div className="input-group">
                                <input type="text" placeholder=" " {...register("channelName", { required: "Channel name is required" })} />
                                {errors.channelName && (
                                    <p className="error-msg">{errors.channelName.message}</p>
                                )}
                                <label>Channel Name (required)</label>
                            </div>
                            <div className="textarea-group">
                                <textarea
                                    placeholder=" "
                                    {...register("channelDescription", {
                                        maxLength: 500,
                                    })}
                                />
                                <label> Channel Description</label>
                            </div>
                            <label>Channel Banner</label>
                            <div className="banner-group">
                                <input
                                    type="file"
                                    accept="image/jpg, image/jpeg, image/png, image/webp"
                                    {...register("channelBanner")}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            setBannerPreview(URL.createObjectURL(file));
                                        }
                                    }} />
                                {bannerPreview && <img src={bannerPreview} alt="banner-preview" style={{ width: "100%", height: "auto", marginTop: "10px" }} />}
                            </div>
                            <button type="submit" disabled={isSubmitting} className="channel-create-btn">
                                Create Channel
                            </button>
                        </form>
                    </div>
                </div>}
        </>
    )
}

export default CreateChannel