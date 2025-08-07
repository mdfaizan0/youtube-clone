import { formatDistanceToNow } from "date-fns"
import "../utils/style.css"
import { convertStoMs, formatViews } from "../utils/videoUtils"
import { Link } from "react-router-dom"

function VideoTile({ video }) {
    const { title, views, createdAt, thumbnailUrl, duration } = video
    const { channelName, verified, channelAvatar } = video.channel
    // const video = {
    //     avatar: "https://yt3.ggpht.com/6tLBV-DRVemxhmanuezR5HkHshX2g7Y46Rq8cysyO1V-nd2SaQ2Fi8cdgVM-n6v_8XZ5BEimxXI=s68-c-k-c0x00ffffff-no-rj",
    //     title: "Logic building | Register controller",
    //     thumbnail: "https://img.youtube.com/vi/VKXnSwNm_lE/maxresdefault.jpg",
    //     channelName: "Chai aur Code",
    //     views: 1234,
    //     verified: true
    // }

    return (
        <Link to={`/watch/${video._id}`} >
            <div className="video-tile">
                <div className="video-thumbnail">
                    <img src={thumbnailUrl} alt={title} ></img>
                    <span className="duration">{convertStoMs(duration)}</span>
                </div>
                <div className="video-details">
                    <img className="video-avatar" src={channelAvatar} alt={channelName} />
                    <div className="video-info">
                        <h2 className="video-title">{title}</h2>
                        <div className="video-channel-details">
                            <p className="video-channel-name" title={channelName}>{channelName}</p>
                            <img src="https://img.icons8.com/?size=100&id=36872&format=png&color=FFFFFF" alt="verified-status" title="Verified" style={verified ? { display: "block" } : { display: "none" }} loading="lazy" />
                        </div>
                        <div className="video-meta">
                            <span>{formatViews(views)}</span>
                            <span className="video-upload-time">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link >
    )
}

export default VideoTile