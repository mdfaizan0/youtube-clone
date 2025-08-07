import { formatDistanceToNow } from "date-fns"
import { convertStoMs, formatViews } from "../utils/videoUtils"
import { Link } from "react-router-dom"

function MiniVideoTile({ video }) {
    const { title, views, createdAt, thumbnailUrl, duration } = video
    const { channelName, verified } = video.channel

    return (
        <Link to={`/watch/${video._id}`} >
            <div className="mini-video-tile">
                <div className="mini-video-thumbnail" >
                    <img src={thumbnailUrl} alt={title} />
                    <span className="duration">{convertStoMs(duration)}</span>
                </div>
                <div className="mini-video-details">
                    <div className="mini-video-info">
                        <h2 className="video-title" title={title}>{title}</h2>
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
        </Link>
    )
}

export default MiniVideoTile