import Search from "./Search"
import { useContext, useState } from "react"
import { GuideContext } from "../utils/GuideContext"
import { Link } from "react-router-dom"
import Sidebar from "./Sidebar"

function Header() {
    const { showGuide, setShowGuide } = useContext(GuideContext)
    const [showCreate, setShowCreate] = useState(false)

    return (
        <div className="header-wrapper">
            <div className="header-container">
                <div className="logo-container">
                    <div className="guide-toggle" onClick={() => setShowGuide(!showGuide)}>
                        <img src="https://img.icons8.com/?size=100&id=36389&format=png&color=FFFFFF" alt="ham-menu" />
                    </div>
                    <div className="main-logo">
                        <Link to="/"><img src="https://i.ibb.co/dJgvjSzY/yt-logo-fullcolor-white-digital.png" alt="main-logo" className="yt-main-logo" /></Link>
                    </div>
                </div>
                {showGuide && <Sidebar />}
                <Search />
                <div className="create-group" onClick={() => setShowCreate(!showCreate)}>
                    <img src="https://img.icons8.com/?size=100&id=11153&format=png&color=FFFFFF" alt="create" />
                    <span>Create</span>
                    <div className="create-options" style={{ display: showCreate ? "block" : "none" }}>
                        <div className="upload-video option">
                            <img src="https://img.icons8.com/?size=100&id=111348&format=png&color=FFFFFF" alt="upload-video" />
                            <span>Upload Video</span>
                        </div>
                        <div className="go-live option">
                            <img src="https://img.icons8.com/?size=100&id=ye3pWzAxNYw3&format=png&color=FFFFFF" alt="go-live" />
                            <span>Go Live</span>
                        </div>
                        <div className="create-post option">
                            <img src="https://img.icons8.com/?size=100&id=Isc1rCN9qu0y&format=png&color=FFFFFF" alt="create-post" />
                            <span>Create Post</span>
                        </div>
                    </div>
                </div>
                <div className="header-sign-in">
                    <Link to="/login" className="signin-btn">
                        <img src="https://img.icons8.com/?size=100&id=23400&format=png&color=FFFFFF" alt="person" />
                        <p>Sign in</p>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Header