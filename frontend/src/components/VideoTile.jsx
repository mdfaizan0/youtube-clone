import "../utils/style.css"

function VideoTile() {
    const video = {
        avatar: "https://yt3.ggpht.com/6tLBV-DRVemxhmanuezR5HkHshX2g7Y46Rq8cysyO1V-nd2SaQ2Fi8cdgVM-n6v_8XZ5BEimxXI=s68-c-k-c0x00ffffff-no-rj",
        title: "Logic building | Register controller",
        thumbnail: "https://img.youtube.com/vi/VKXnSwNm_lE/maxresdefault.jpg",
        channelName: "Chai aur Code",
        views: 1234,
        verified: true
    }

    let formattedViews = video.views

    if (video.views >= 1000000000) {
        formattedViews = formattedViews / 1000000000
        formattedViews = `${Math.floor(formattedViews)}B views`
    } else if (video.views >= 1000000) {
        formattedViews = formattedViews / 1000000
        let rounded = Math.round(formattedViews * 10) / 10

        if (rounded >= 1000) {
            formattedViews = `${Math.floor(rounded / 1000)}B views`
        } else if (rounded === Math.floor(rounded)) {
            formattedViews = `${Math.floor(rounded)}M views`
        } else {
            formattedViews = `${rounded.toFixed(1)}M views`
        }
    } else if (video.views >= 1000) {
        formattedViews = Math.floor(formattedViews / 1000)
        formattedViews = `${formattedViews}K views`
    } else {
        formattedViews = `${formattedViews} views`
    }

    return (
        <div className="video-tile">
            <div className="video-thumbnail">
                <img src={video.thumbnail} alt={video.title} />
            </div>
            <div className="video-details">
                <img className="video-avatar" src={video.avatar} alt={video.channelName} />
                <div className="video-info">
                    <h2 className="video-title">{video.title}</h2>
                    <div className="video-channel-details">
                        <p className="video-channel-name" title={video.channelName}>{video.channelName}</p>
                        <img src="https://img.icons8.com/?size=100&id=36872&format=png&color=FFFFFF" alt="verified-status" title="Verified" style={video.verified ? { display: "block" } : { display: "none" }} loading="lazy"/>
                    </div>
                    <div className="video-meta">
                        <span>{formattedViews}</span>
                        <span className="video-upload-time">4 days ago</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoTile