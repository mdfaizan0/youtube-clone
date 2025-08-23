import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GET_CHANNEL, SUB_CHANNEL } from '../utils/API_CONFIG'
import { useState } from 'react'
import MiniVideoTile from '../components/MiniVideoTile'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

function PublicChannel() {
    // a replica of ManageChannel, but without any editing chaos, 
    // just showing the details received from BE
    // just difference is that handling subscribing and showing action sign in box same as VideoPlayer
    const { channelId } = useParams()
    const [channel, setChannel] = useState(null)
    const [videos, setVideos] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showActionSignin, setShowActionSignin] = useState(false)
    const [toggleSub, setToggleSub] = useState(false)
    const user = useSelector(state => state.user.user)
    const token = useSelector(state => state.user.token)

    // getting channel details from BE
    useEffect(() => {
        setLoading(true)
        async function fetchChannel() {
            try {
                const res = await fetch(`${GET_CHANNEL}/${channelId}`)
                const data = await res.json()
                setChannel(data.channel)
                setVideos(data.channel.videos)
            } catch (error) {
                console.error("Error while fetching public channel", error)
            } finally {
                setLoading(false)
            }
        }
        fetchChannel()
    }, [])

    // handling subscribing by sending relevant action based on alreadySubscribed
    async function handleSubscribe() {
        try {
            const alreadySubscribed = channel?.subscribers?.includes(user?._id)
            const action = alreadySubscribed ? "dec" : "inc"
            await fetch(`${SUB_CHANNEL}/${channel._id}`, {
                method: 'PUT',
                headers: {
                    "Content-type": "application/json",
                    "authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ action })
            })

            // getting updated video details from BE and setting it to show updated video details on UI
            const updatedVideoRes = await fetch(`${GET_CHANNEL}/${channel._id}`);
            const updatedData = await updatedVideoRes.json();
            setChannel(updatedData.channel);

            toast.success(`${alreadySubscribed ? "Unsubscribed" : "Subscribed"} ${channel?.channelName}`)
            setToggleSub(!toggleSub)
        } catch (error) {
            console.error("Error while fetching handling subscribe action", error)
        }
    }

    useEffect(() => {
        if (channel?.channelName) {
            document.title = `${channel?.channelName} - YouTube`
        }
    }, [channel])

    const isSubscribed = channel?.subscribers?.includes(user?._id)

    return (
        <>
            {loading ? (
                <div className="loading-container">
                    <div className="loading-msg"></div>
                </div>
            ) : (
                <div className="channel-page">
                    <div className="channel-banner">
                        <img src={channel.channelBanner} alt="channelBanner" loading="lazy" />
                    </div>
                    <div className="channel-profile">
                        <div className="channel-avatar">
                            <img src={channel.channelAvatar} alt="channelAvatar" loading="lazy" />
                        </div>
                        <div className="profile-info">
                            <div className="channel-name-container">
                                <div className="channel-name-block">
                                    <span>{channel.channelName}</span>
                                    <img
                                        src="https://img.icons8.com/?size=100&id=36872&format=png&color=FFFFFF"
                                        alt="verified-status"
                                        title="Verified"
                                        style={channel?.verified ? { display: "block" } : { display: "none" }}
                                        loading="lazy" />
                                </div>
                            </div>
                            <div className="profile-meta">
                                <div className="profile-username">
                                    <strong>@{channel.owner.username}</strong>
                                </div>
                                <div className="profile-information">
                                    <span>•</span>
                                    <span>{channel.subscriberCount} subscriber{channel.subscriberCount > 1 ? "s" : ""}</span>
                                    <span>•</span>
                                    <span>{channel.videos.length} video{channel.videos.length > 1 ? "s" : ""}</span>
                                    <span>•</span>
                                    <span>created {new Date(channel.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                </div>
                            </div>
                            <div className="channel-descrip-block">
                                <p>{channel.channelDescription}</p>
                            </div>
                            <div className="manage-channel-actions">
                                <button onClick={token !== null ? handleSubscribe : () => setShowActionSignin(!showActionSignin)} >
                                    {isSubscribed ? (
                                        <>
                                            <img src="https://img.icons8.com/?size=100&id=M0zWhR81xxgX&format=png&color=000000" alt="subscribed-icon" loading="lazy" />
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
                    </div>
                    <span>Videos</span>
                    <div className="channel-videos">
                        {
                            videos.length > 0 ?
                                videos.map(video => {
                                    return <MiniVideoTile video={video} key={video._id} page="channel" />
                                }) :
                                <div className="no-videos-cta">
                                    <img src="https://www.gstatic.com/youtube/img/channels/core_channel_no_activity_dark.svg" alt="no-videos-cta" style={{ width: "250px" }} loading="lazy" />
                                    <strong>This channel doesn't have any content</strong>
                                </div>
                        }
                    </div>
                </div>
            )}
        </>
    )
}

export default PublicChannel