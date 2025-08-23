import { formatDistanceToNow } from "date-fns"
import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { SEARCH } from "../utils/API_CONFIG"
import { convertStoMs, formatViews } from "../utils/videoUtils"

function SearchResults() {
    // setting states for loading, resultvideos and message to show error
    const [resultVideos, setResultVideos] = useState(null)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [searchParams] = useSearchParams()
    const query = searchParams.get("q")?.trim()

    useEffect(() => {
        document.title = `${query} - YouTube`
    }, [query])

    useEffect(() => {
        // if there is no query, dont show loading screen
        if (!query) {
            setLoading(false)
            return
        }

        // calling backend with proper endpoints and actual query, setting result videos and setting message as empty string
        async function fetchSearch() {
            try {
                setLoading(true)
                const res = await fetch(`${SEARCH}?q=${query}`)
                const data = await res.json()
                if (res.status === 404) {
                    setMessage(data.message)
                    setResultVideos(null)
                } else {
                    console.log(data.videos)
                    setResultVideos(data.videos)
                    setMessage("")
                }
            } catch (error) {
                toast.error("Unable to fetch feed videos")
                console.error("Unable to fetch feed videos", error)
            } finally {
                setLoading(false)
            }
        }
        fetchSearch()
    }, [query])

    console.log(resultVideos)

    return (
        <div className="search-results-page">
            {loading ? <div className="loading-container"><div className="loading-msg"></div></div> :
                query && resultVideos ? resultVideos.map(video => {
                    return (
                        <div className="search-tile" key={video._id}>
                            <Link to={`/watch/${video._id}`} className="search-tile-img">
                                <img src={video.thumbnailUrl} alt="thumbnail" loading="lazy" />
                                <span className="duration">{convertStoMs(video.duration)}</span>
                            </Link>
                            <div className="search-tile-details">
                                <Link to={`/watch/${video._id}`} className="search-tile-title">
                                    <p>{video.title}</p>
                                </Link>
                                <div className="search-tile-channel-meta">
                                    <div className="search-tile-meta">
                                        <small>{formatViews(video.views)}</small>
                                        <small>•</small>
                                        <small>{formatDistanceToNow(video.createdAt)}</small>
                                    </div>
                                    <div className="search-tile-channel">
                                        <Link to={`/channel/${video.channel._id}`}><img src={video.channel.channelAvatar} alt="channel-avatar" loading="lazy" /></Link>
                                        <Link to={`/channel/${video.channel._id}`}><small>{video.channel.channelName}</small></Link>
                                        <img src="https://img.icons8.com/?size=100&id=36872&format=png&color=FFFFFF" alt="verified-status" title="Verified" style={video.channel.verified ? { display: "block" } : { display: "none" }} loading="lazy" />
                                    </div>
                                </div>
                                <small>{video.description}</small>
                            </div>
                        </div>
                    )
                }) :
                    <div className="no-result-container">
                        <img src="https://i.ibb.co/rRJyzDCk/svgviewer-png-output-1.png" alt="no-result-blob" loading="lazy" />
                        <p>{message || "No results found"}</p>
                        <small>Try different keywords</small>
                    </div>}
        </div>
    )
}

export default SearchResults