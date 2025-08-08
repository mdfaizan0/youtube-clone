import { useContext, useEffect, useState } from "react"
import "../utils/style.css"
import { GuideContext } from "../utils/GuideContext"
import MiniVideoTile from "../components/MiniVideoTile"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ALL_VIDEOS, COMMENT, PLAY_VIDEO, REACT_VIDEO, SUB_CHANNEL } from "../utils/API_CONFIG"
import Comment from "../components/Comment"
import { formatDistanceToNow } from "date-fns"
import { formatViews } from "../utils/videoUtils"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"

function VideoPlayer() {
    const [showSignin, setShowSignin] = useState(false)
    const [showActionSignin, setShowActionSignin] = useState(false)
    const [showReactionSignin, setShowReactionSignin] = useState(false)
    const [toggleSub, setToggleSub] = useState(false)
    const [video, setVideo] = useState(null)
    const [comment, setComment] = useState("")
    const [showCommentBtn, setShowCommentBtn] = useState(false)
    const [recommendations, setRecommendations] = useState(null)
    const { videoId } = useParams()
    const { showGuide } = useContext(GuideContext)
    const token = useSelector(state => state.user.token)
    const user = useSelector(state => state.user.user)
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchVideo() {
            try {
                const res = await fetch(`${PLAY_VIDEO}/${videoId}`);
                if (res.status === 404) {
                    navigate("/404", {
                        replace: true,
                        state: {
                            from: `/watch/${videoId}`,
                            status: 404,
                            message: "Video not found."
                        }
                    });
                    return;
                }
                const data = await res.json();
                if (!data.video) {
                    navigate("/404", {
                        replace: true,
                        state: {
                            from: `/watch/${videoId}`,
                            status: 404,
                            message: "Video not found."
                        }
                    });
                    return;
                }
                setVideo(data.video);
            } catch (error) {
                console.error("Error while fetching video", error);
                navigate("/404", {
                    replace: true,
                    state: {
                        from: `/watch/${videoId}`,
                        status: 500,
                        message: "Something went wrong fetching the video."
                    }
                });
            }
        }
        fetchVideo();
    }, [videoId]);

    useEffect(() => {
        async function fetchRecomm() {
            try {
                const res = await fetch(`${ALL_VIDEOS}`)
                const data = await res.json()
                setRecommendations(data.videos)
            } catch (error) {
                console.error("Error while fetching recommended videos", error)
            }
        }
        fetchRecomm()
    }, [video])

    async function handleSubscribe() {
        try {
            const alreadySubscribed = video?.channel?.subscribers?.includes(user?._id)
            const action = alreadySubscribed ? "dec" : "inc"
            const res = await fetch(`${SUB_CHANNEL}/${video.channel._id}`, {
                method: 'PUT',
                headers: {
                    "Content-type": "application/json",
                    "authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ action })
            })
            const data = await res.json()
            console.log(data)

            const updatedVideoRes = await fetch(`${PLAY_VIDEO}/${videoId}`);
            const updatedData = await updatedVideoRes.json();
            setVideo(updatedData.video);

            toast.success(`${alreadySubscribed ? "Unsubscribed" : "Subscribed"} ${video?.channel?.channelName}`)
            setToggleSub(!toggleSub)
        } catch (error) {
            console.error("Error while fetching handling subscribe action", error)
        }
    }

    async function handleReaction(action) {
        try {
            const res = await fetch(`${REACT_VIDEO}/${video?._id}`, {
                method: "PUT",
                headers: {
                    "Content-type": "application/json",
                    "authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ action })
            })
            const data = await res.json()
            if (res.status === 200) {
                const updatedVideoRes = await fetch(`${PLAY_VIDEO}/${videoId}`);
                const updatedData = await updatedVideoRes.json();
                setVideo(updatedData.video);
            } else {
                toast(data.message)
            }
        } catch (error) {
            console.error("Error while adding reaction", error)
            toast.error("Error while adding reaction")
        }
    }

    async function handleAddComment() {
        if (comment.trim() == "") {
            toast.error("Cannot add empty comment")
            return
        }
        try {
            const res = await fetch(`${COMMENT}/${video?._id}`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                    "authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ comment })
            })
            const data = await res.json()
            if (res.status === 201) {
                const updatedVideoRes = await fetch(`${PLAY_VIDEO}/${videoId}`);
                const updatedData = await updatedVideoRes.json();
                setVideo(updatedData.video);
                toast.success(data.message)
                setComment("")
                setShowCommentBtn(false)
            } else {
                toast(data.message)
            }
        } catch (error) {
            console.error("Error while adding comment", error)
        }
    }

    const sortedComments = [...(video?.comments || [])].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    )
    const isSubscribed = video?.channel?.subscribers?.includes(user?._id)
    const filteredRecom = recommendations?.filter(rec => rec?._id !== video?._id)
    const hasLiked = video?.likedBy?.includes(user?._id)
    const hasDisliked = video?.dislikedBy?.includes(user?._id)

    if (!video) return <div className="loading-container"><div className="loading-msg"></div></div>;

    return (
        <div className="player-page" style={{ opacity: showGuide ? 0.4 : 1, pointerEvents: showGuide ? "none" : "auto", userSelect: showGuide ? "none" : "auto" }}>
            <div className="video-player-container">
                <div className="video-player">
                    <video src={video?.videoUrl} controls></video>
                </div>
                <div className="video-player-meta">
                    <h1>{video.title}</h1>
                    <div className="extra-options">
                        <div className="channel-block">
                            <img className="video-avatar" src={video.channel?.channelAvatar} alt={video.channel?.channelName} />
                            <div className="channel-meta">
                                <Link to={`/channel/${video.channel?._id}`} className="channel-name">
                                    <p>{video.channel?.channelName}</p>
                                    <img
                                        src="https://img.icons8.com/?size=100&id=36872&format=png&color=FFFFFF"
                                        alt="verified-status"
                                        title="Verified"
                                        style={video.channel?.verified ? { display: "block" } : { display: "none" }}
                                        loading="lazy" />
                                </Link>
                                <span>{video.channel?.subscriberCount} subscribers</span>
                            </div>
                            <div className="channel-actions" onClick={() => setShowActionSignin(!showActionSignin)}>
                                <button>Join</button>
                                <button onClick={token !== null ? handleSubscribe : () => setShowActionSignin(!showActionSignin)} >
                                    {isSubscribed ? (
                                        <>
                                            <img src="https://img.icons8.com/?size=100&id=M0zWhR81xxgX&format=png&color=000000" alt="subscribed-icon" />
                                            Subscribed
                                        </>
                                    ) : (
                                        "Subscribe"
                                    )}
                                </button>
                                {token ? null : <div className="channel-action-signin" style={{ display: showActionSignin ? "flex" : "none" }}>
                                    <span>Want to join the action?</span>
                                    <small>Sign in to subscribe to this channel</small>
                                    <button><Link to="/login">Sign in</Link></button>
                                </div>}
                            </div>
                        </div>
                        <div className="video-options">
                            {token ? null : <div className="reaction-cta" style={{ display: showReactionSignin ? "flex" : "none" }}>
                                <span>Want to react on this video?</span>
                                <small>Sign in to make your opinion count</small>
                                <button><Link to="/login">Sign in</Link></button>
                            </div>}
                            <div className="likes-block" onClick={() => setShowReactionSignin(!showReactionSignin)}>
                                <div className="likes" onClick={token ? (e) => {
                                    e.stopPropagation()
                                    handleReaction("like")
                                } : null}>
                                    <img src={hasLiked ? "https://img.icons8.com/?size=100&id=85618&format=png&color=FFFFFF" :
                                        "https://img.icons8.com/?size=100&id=85608&format=png&color=FFFFFF"}
                                        alt="likes" />
                                    <span>{video.likes}</span>
                                </div>
                                <div className="dislikes" onClick={token ? (e) => {
                                    e.stopPropagation()
                                    handleReaction("dislike")
                                } : null}>
                                    <img src={hasDisliked ? "https://img.icons8.com/?size=100&id=87726&format=png&color=FFFFFF" :
                                        "https://img.icons8.com/?size=100&id=87695&format=png&color=FFFFFF"}
                                        style={{ transform: "scaleX(-1)" }}
                                        alt="dislikes" />
                                    <span>{video.dislikes}</span>
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
                            <span>{formatViews(video.views)}</span>
                            {video?.createdAt ? (
                                <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                            ) : (
                                null
                            )}
                        </div>
                        <p>{video?.description}</p>
                    </div>
                    <div className="comments-container">
                        <div className="comments-head">
                            <h3>{video?.comments?.length} Comments</h3>
                            <div className="comment-cta">
                                <img src={token ? user.avatar : "https://yt3.ggpht.com/a/default-user=s48-c-k-c0x00ffffff-no-rj"} alt="default-avatar" />
                                {token ?
                                    <div className="add-comment">
                                        <input type="text"
                                            placeholder="Add a comment..."
                                            value={comment}
                                            onFocus={() => setShowCommentBtn(true)}
                                            onChange={(e) => {
                                                setComment(e.target.value)
                                            }} />
                                        <div className="add-comment-btns" style={{ display: showCommentBtn ? "flex" : "none" }}>
                                            <span className="add-comment-btn add-comment-cancel" onClick={() => setShowCommentBtn(false)}>Cancel</span>
                                            <button className="add-comment-btn add-comment-submit" disabled={comment.trim() === ""} onClick={handleAddComment}>Submit</button>
                                        </div>
                                    </div> : <p onClick={() => setShowSignin(!showSignin)}>Add a comment...</p>}
                                {token ? null : <div className="signin-cta-comments" style={{ display: showSignin ? "flex" : "none" }}>
                                    <span>Want to join the conversation?</span>
                                    <small>Sign in to continue</small>
                                    <button><Link to="/login">Sign in</Link></button>
                                </div>}
                            </div>
                        </div>
                        {sortedComments.length === 0 ? "" :
                            sortedComments.map(comment => {
                                return <Comment comment={comment} key={comment._id} videoId={video?._id} setVideo={setVideo} />
                            })}
                    </div>
                </div>
            </div>
            <div className="recommendations">
                {filteredRecom?.map(rec => {
                    return <MiniVideoTile video={rec} key={rec._id} />
                })}
            </div>
        </div>
    )
}

export default VideoPlayer