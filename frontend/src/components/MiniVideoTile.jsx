import { formatDistanceToNow } from "date-fns"
import { convertStoMs, formatViews } from "../utils/videoUtils"
import { Link } from "react-router-dom"
import { useState } from "react"

function MiniVideoTile({ video, page, isOwner, handleVideoEdit, handleVideoDelete }) {
    // getting states
    const [showVideoEditOption, setShowVideoEditOption] = useState(false)
    const { title, views, createdAt, thumbnailUrl, duration } = video

    // taking out details what is needed here from props
    const channelName = video?.channel?.channelName
    const verified = video?.channel?.verified
    const _id = video?.channel?._id

    return (
        <div className={`mini-video-tile ${page === "channel" ? "flex-row" : ""}`}>
            <Link to={`/watch/${video._id}`} className={`mini-video-thumbnail ${page === "channel" ? "channel-hw" : ""}`} >
                <img src={thumbnailUrl} alt={title} />
                <span className="duration">{convertStoMs(duration)}</span>
            </Link>
            <div className="mini-video-details" style={{ padding: page === "channel" ? "6px 0" : "6px 10px" }}>
                <div className={`mini-video-info ${page === "channel" ? "less-gap" : ""}`}>
                    <div className="video-title-tile-block"  >
                        <Link to={`/watch/${video._id}`}><h2 className="video-title" title={title}>{title}</h2></Link>
                        <img
                            src="https://img.icons8.com/?size=100&id=84119&format=png&color=FFFFFF"
                            alt="save"
                            className="options-img-tile"
                            style={{ display: isOwner ? "block" : "none" }}
                            onClick={() => setShowVideoEditOption(!showVideoEditOption)}
                        />
                    </div>
                    <div className="channel-video-options" style={{ display: showVideoEditOption ? "flex" : "none" }}>
                        <div className="comment-option edit" onClick={() => {
                            setShowVideoEditOption(!showVideoEditOption)
                            handleVideoEdit(video)
                        }}>
                            <img src="https://img.icons8.com/?size=100&id=15069&format=png&color=FFFFFF" alt="edit-icon" />
                            <span>Edit</span>
                        </div>
                        <div className="comment-option delete" onClick={() => {
                            handleVideoDelete(video)
                            setShowVideoEditOption(!showVideoEditOption)
                        }}>
                            <img src="https://img.icons8.com/?size=100&id=83238&format=png&color=FFFFFF" alt="delete-icon" />
                            <span>Delete</span>
                        </div>
                    </div>
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
        </div >
    )
}

export default MiniVideoTile