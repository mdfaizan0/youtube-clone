import { useContext, useState } from "react"
import "../utils/style.css"
import { GuideContext } from "../utils/GuideContext"
import Comment from "../components/Comment"
import MiniVideoTile from "../components/MiniVideoTile"

function VideoPlayer() {
    const { showGuide } = useContext(GuideContext)
    const [showSignin, setShowSignin] = useState(false)
    const video = {
        avatar: "https://yt3.ggpht.com/6tLBV-DRVemxhmanuezR5HkHshX2g7Y46Rq8cysyO1V-nd2SaQ2Fi8cdgVM-n6v_8XZ5BEimxXI=s68-c-k-c0x00ffffff-no-rj",
        title: "Logic building | Register controller",
        thumbnail: "https://img.youtube.com/vi/VKXnSwNm_lE/maxresdefault.jpg",
        channelName: "Chai aur Code",
        views: 1234,
        verified: true
    }

    return (
        <div className="player-page" style={{ opacity: showGuide ? 0.4 : 1, pointerEvents: showGuide ? "none" : "auto", userSelect: showGuide ? "none" : "auto" }}>
            <div className="video-player-container">
                <div className="video-player">
                    <video src="https://videos.pexels.com/video-files/4169986/4169986-uhd_2560_1440_30fps.mp4" controls></video>
                </div>
                <div className="video-player-meta">
                    <h1>{video.title}</h1>
                    <div className="extra-options">
                        <div className="channel-block">
                            <img className="video-avatar" src={video.avatar} alt={video.channelName} />
                            <div className="channel-meta">
                                <div className="channel-name">
                                    <p>{video.channelName}</p>
                                    <img src="https://img.icons8.com/?size=100&id=36872&format=png&color=FFFFFF" alt="verified-status" title="Verified" style={video.verified ? { display: "block" } : { display: "none" }} loading="lazy" />
                                </div>
                                <span>349k subscribers</span>
                            </div>
                            <div className="channel-actions">
                                <button>Join</button>
                                <button>Subscribe</button>
                            </div>
                        </div>
                        <div className="video-options">
                            <div className="likes-block">
                                <div className="likes">
                                    <img src="https://img.icons8.com/?size=100&id=15956&format=png&color=FFFFFF" alt="likes" />
                                    <span>35K</span>
                                </div>
                                <div className="dislikes">
                                    <img src="https://img.icons8.com/?size=100&id=15957&format=png&color=FFFFFF" alt="dislikes" />
                                    <span>11K</span>
                                </div>
                            </div>
                            <button>
                                <img src="https://img.icons8.com/?size=100&id=K6OM9OBagzCm&format=png&color=FFFFFF" alt="share" />
                                <span>Share</span>
                            </button>
                            <button>
                                <img src="https://img.icons8.com/?size=100&id=14100&format=png&color=FFFFFF" alt="download" />
                                <span>Download</span>
                            </button>
                            <button>
                                <img src="https://img.icons8.com/?size=100&id=82461&format=png&color=FFFFFF" alt="save" />
                                <span>Save</span>
                            </button>
                            <button>
                                <img src="https://img.icons8.com/?size=100&id=84119&format=png&color=FFFFFF" alt="save" className="options-img" />
                            </button>
                        </div>
                    </div>
                    <div className="video-description">
                        <div className="video-description-meta">
                            <span>{video.views} views</span>
                            <span>4 days ago</span>
                        </div>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus expedita eveniet minus explicabo sit impedit natus repellendus vel magnam ducimus! Dolor numquam ex qui neque, eius nesciunt veniam harum quo natus, reiciendis sequi voluptatibus nemo. Accusamus nulla, maxime laborum cupiditate, labore molestiae deleniti illum reiciendis vero itaque in. Eveniet, mollitia quas. Exercitationem impedit doloribus aliquam sed!</p>
                    </div>
                    <div className="comments-container">
                        <div className="comments-head">
                            <h3>502 Comments</h3>
                            <div className="comment-cta"> {/** this should only show when the user is not signed in */}
                                <img src="https://yt3.ggpht.com/a/default-user=s48-c-k-c0x00ffffff-no-rj" alt="default-avatar" />
                                <p onClick={() => setShowSignin(!showSignin)}>Add a comment...</p>
                                <div className="signin-cta-comments" style={{ display: showSignin ? "flex" : "none" }}>
                                    <span>Want to join the conversation?</span>
                                    <small>Sign in to continue</small>
                                    <button>Sign in</button>
                                </div>
                            </div>
                        </div>
                        <Comment />
                        <Comment />
                        <Comment />
                        <Comment />
                    </div>
                </div>
            </div>
            <div className="recommendations">
                <MiniVideoTile />
                <MiniVideoTile />
                <MiniVideoTile />
                <MiniVideoTile />
                <MiniVideoTile />
                <MiniVideoTile />
                <MiniVideoTile />
            </div>
        </div>
    )
}

export default VideoPlayer