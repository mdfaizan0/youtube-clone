function MiniVideoTile() {
    const video = {
        avatar: "https://yt3.ggpht.com/6tLBV-DRVemxhmanuezR5HkHshX2g7Y46Rq8cysyO1V-nd2SaQ2Fi8cdgVM-n6v_8XZ5BEimxXI=s68-c-k-c0x00ffffff-no-rj",
        title: "Logic building | Register controller",
        thumbnail: "https://img.youtube.com/vi/VKXnSwNm_lE/maxresdefault.jpg",
        channelName: "Chai aur Code",
        views: 1234,
        verified: true
    }

    return (
        <div className="mini-video-tile">
            <div className="mini-video-thumbnail">
                <img src={video.thumbnail} alt={video.title} />
            </div>
            <div className="mini-video-details">
                <div className="mini-video-info">
                    <h2 className="video-title" title={video.title}>{video.title}</h2>
                    <div className="video-channel-details">
                        <p className="video-channel-name" title={video.channelName}>{video.channelName}</p>
                        <img src="https://img.icons8.com/?size=100&id=36872&format=png&color=FFFFFF" alt="verified-status" title="Verified" style={video.verified ? { display: "block" } : { display: "none" }} loading="lazy" />
                    </div>
                    <div className="video-meta">
                        <span>{video.views} views</span>
                        <span className="video-upload-time">4 days ago</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MiniVideoTile