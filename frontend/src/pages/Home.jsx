import VideoTile from "../components/VideoTile"
import { useContext, useEffect, useState } from "react"
import { GuideContext } from "../utils/GuideContext"
import Sidebar from "../components/Sidebar"
import GuideAside from "../components/GuideAside"
import { ALL_VIDEOS } from "../utils/API_CONFIG"
import MobileNav from "../components/MobileNav"

function Home() {
  useEffect(() => {
    document.title = "YouTube"
  }, [])

  // setting relevant states
  const [feed, setFeed] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filteredFeed, setFilteredFeed] = useState(null)
  const [activeCategory, setActiveCategory] = useState("All")
  // getting guide state from guide context
  const { showGuide, setShowGuide } = useContext(GuideContext)

  // setting feed to to filtered feed to iniltialize after successful feed fetch from BE
  useEffect(() => {
    if (feed) setFilteredFeed(feed)
  }, [feed])

  // fetching videos from BE and setting feed 
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

  // getting all the unique categories
  const categories = [...new Set(feed?.map(vid => vid.category))]

  // getting active category and if category is ALl, setting filtered feed to whole videos, else, 
  // filtering feed and setting filtered feed to only those videos which are same as cat paramters
  function handleCategory(cat) {
    setActiveCategory(cat)
    if (cat === "All") {
      setFilteredFeed(feed)
    } else {
      setFilteredFeed(feed.filter(
        vid => vid.category.trim().toLowerCase() === cat.trim().toLowerCase()
      ))
    }
  }

  return (
    <>
      {loading ? (
        <div className="loading-container">
          <div className="loading-msg"></div>
        </div>
      ) :
        <div className="content-container" onClick={() => setShowGuide(false)}>
          {showGuide ? <Sidebar /> : <GuideAside />}
          <div className="category-bar" style={{ marginLeft: showGuide ? "12vw" : "4vw" }} >
            <span className={activeCategory === "All" ? "active" : ""} onClick={() => handleCategory("All")}>All</span>
            {categories.map((cat, index) => <span className={activeCategory === cat ? "active" : ""} key={index} onClick={() => handleCategory(cat)}>{cat}</span>)}
          </div>
          <div className="video-grid" style={{ marginLeft: showGuide ? "12vw" : "4vw" }} >
            {filteredFeed?.map(vid => {
              return <VideoTile video={vid} key={vid._id} />
            })}
          </div>
          <MobileNav />
        </div>
      }
    </>
  )
}

export default Home