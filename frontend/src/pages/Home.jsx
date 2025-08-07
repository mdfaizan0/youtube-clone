import VideoTile from "../components/VideoTile"
import { useContext, useEffect, useState } from "react"
import { GuideContext } from "../utils/GuideContext"
import Sidebar from "../components/Sidebar"
import GuideAside from "../components/GuideAside"
import { ALL_VIDEOS } from "../utils/API_CONFIG"

function Home() {
  const [feed, setFeed] = useState(null)
  const { showGuide } = useContext(GuideContext)

  useEffect(() => {
    async function fetchFeed() {
      const res = await fetch(`${ALL_VIDEOS}`)
      const data = await res.json()
      setFeed(data.videos)
    }
    fetchFeed()
  }, [])

  return (
    <div className="content-container">
      {showGuide ? <Sidebar /> : <GuideAside />}
      <div className="category-bar" style={{ marginLeft: showGuide ? "12vw" : "4vw" }} >
        <span>All</span>
        <span>APIs</span>
        <span>Scripting Language</span>
        <span>Gaming</span>
        <span>AI</span>
      </div>
      <div className="video-grid" style={{ marginLeft: showGuide ? "12vw" : "4vw" }} >
        {feed?.map(vid => {
          return <VideoTile video={vid} key={vid._id} />
        })}
      </div>
    </div>
  )
}

export default Home