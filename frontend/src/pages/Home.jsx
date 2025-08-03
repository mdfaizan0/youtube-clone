import VideoTile from "../components/VideoTile"
import { useContext } from "react"
import { GuideContext } from "../utils/GuideContext"
import Sidebar from "../components/Sidebar"
import GuideAside from "../components/GuideAside"

function Home() {
  const { showGuide } = useContext(GuideContext)

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
        <VideoTile />
        <VideoTile />
        <VideoTile />
        <VideoTile />
        <VideoTile />
      </div>
    </div>
  )
}

export default Home