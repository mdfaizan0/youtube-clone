import VideoTile from "../components/VideoTile"
import { useContext, useEffect, useState } from "react"
import { GuideContext } from "../utils/GuideContext"
import Sidebar from "../components/Sidebar"
import GuideAside from "../components/GuideAside"
import { ALL_VIDEOS } from "../utils/API_CONFIG"

function Home() {
  const [feed, setFeed] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showGuide } = useContext(GuideContext)

  useEffect(() => {
    setLoading(true)
    async function fetchFeed() {
      try {
        const res = await fetch(ALL_VIDEOS)
        const data = await res.json()
        if (res.status === 200) {
          setFeed(data.videos)
        } else {
          navigate("/404", {
            replace: true,
            state: {
              from: `/`,
              status: res.status,
              messaage: "Unable to fetch feed videos"
            }
          })
        }
      } catch (error) {
        toast.error("Unable to fetch feed videos")
        console.error("Unable to fetch feed videos", error)
      } finally {
        setLoading(false)
      }
    }
    fetchFeed()
  }, [])

  return (
    <>
      {loading ? (
        <div className="loading-container">
          <div className="loading-msg"></div>
        </div>
      ) :
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
      }
    </>
  )
}

export default Home