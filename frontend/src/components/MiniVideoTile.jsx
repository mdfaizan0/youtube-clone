import { formatDistanceToNow } from "date-fns"
import { convertStoMs, formatViews } from "../utils/videoUtils"
import { Link } from "react-router-dom"

function MiniVideoTile({ video, page }) {
    const { title, views, createdAt, thumbnailUrl, duration } = video
    const { channelName, verified, _id } = video.channel

    return (
        <div className={`mini-video-tile ${page === "channel" ? "flex-row" : ""}`}>
            <Link to={`/watch/${video._id}`} className={`mini-video-thumbnail ${page === "channel" ? "channel-hw" : ""}`} >
                <img src={thumbnailUrl} alt={title} />
                <span className="duration">{convertStoMs(duration)}</span>
            </Link>
            <div className="mini-video-details">
                <div className={`mini-video-info ${page === "channel"? "less-gap" : ""}`}>
                    <Link to={`/watch/${video._id}`} ><h2 className="video-title" title={title}>{title}</h2></Link>
                    <Link to={`/channel/${_id}`} className="video-channel-details">
                        <p className="video-channel-name" title={channelName}>{channelName}</p>
                        <img src="https://img.icons8.com/?size=100&id=36872&format=png&color=FFFFFF" alt="verified-status" title="Verified" style={verified ? { display: "block" } : { display: "none" }} loading="lazy" />
                    </Link>
                    <div className="video-meta">
                        <span>{formatViews(views)}</span>
                        <span className="video-upload-time">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MiniVideoTile