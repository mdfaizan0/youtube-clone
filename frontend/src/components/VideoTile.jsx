import { formatDistanceToNow } from "date-fns"
import "../utils/style.css"
import { convertStoMs, formatViews } from "../utils/videoUtils"
import { Link } from "react-router-dom"

function VideoTile({ video }) {
    // getting relevant details destructured from the video prop
    const { title, views, createdAt, thumbnailUrl, duration } = video
    const { channelName, verified, channelAvatar, _id } = video.channel

    return (
        <div className="video-tile">
            <Link to={`/watch/${video._id}`} className="video-thumbnail">
                <img src={thumbnailUrl} alt={title} loading="lazy"/>
                <span className="duration">{convertStoMs(duration)}</span>
            </Link>
            <div className="video-details">
                <Link to={`/channel/${_id}`}><img className="video-avatar" src={channelAvatar} alt={channelName} loading="lazy"/></Link>
                <div className="video-info">
                    <Link to={`/watch/${video._id}`}><h2 className="video-title">{title}</h2></Link>
                    <div className="video-channel-details">
                        <Link to={`/channel/${_id}`}><p className="video-channel-name" title={channelName}>{channelName}</p></Link>
                        <img src="https://img.icons8.com/?size=100&id=36872&format=png&color=FFFFFF" alt="verified-status" title="Verified" style={verified ? { display: "block" } : { display: "none" }} loading="lazy" />
                    </div>
                    <div className="video-meta">
                        <span>{formatViews(views)}</span>
                        {/* using formatDistanceToNow from "date-fns" to convert date string to about 2 mins ago, about 18 hours ago*/}
                        <span className="video-upload-time">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoTile