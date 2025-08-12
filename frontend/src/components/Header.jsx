import Search from "./Search"
import { useContext, useEffect, useState } from "react"
import { GuideContext } from "../utils/GuideContext"
import { Link, useNavigate } from "react-router-dom"
import Sidebar from "./Sidebar"
import { useDispatch, useSelector } from "react-redux"
import { logout, setUser } from "../utils/userSlice"
import { getProfile } from "../utils/authUtils"
import toast from "react-hot-toast"

function Header() {
    // getting necessary states
    const { showGuide, setShowGuide } = useContext(GuideContext)
    const [showCreate, setShowCreate] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const [showMobileSearch, setShowMobileSearch] = useState(false)
    // getting dispatch and naviagte rect-router-dom
    const dispatch = useDispatch()
    const navigate = useNavigate()
    // getting user and token states from redux
    const token = useSelector(state => state.user.token)
    const user = useSelector(state => state.user.user)

    const isLoggedIn = Boolean(token)

    // getting updated user info from BE every time dependencies change, to show updated user info
    useEffect(() => {
        const fetchUser = async () => {
            const result = await getProfile(token);
            if (!result) {
                dispatch(logout());
            } else if (result.expired) {
                toast.error("Session Expired, please login again")
                dispatch(logout());
            } else {
                dispatch(setUser(result.user));
            }
        };
        if (!user) fetchUser();
    }, [token, dispatch, navigate, user, user?.channels]);

    return (
        <div className="header-wrapper">
            <div className="header-container">
                <div className="logo-container">
                    <div className="guide-toggle" onClick={() => setShowGuide(!showGuide)}>
                        <img src="https://img.icons8.com/?size=100&id=36389&format=png&color=FFFFFF" alt="ham-menu" loading="lazy"/>
                    </div>
                    <div className="main-logo">
                        <Link to="/"><img src="https://i.ibb.co/dJgvjSzY/yt-logo-fullcolor-white-digital.png" alt="main-logo" className="yt-main-logo" loading="lazy"/></Link>
                    </div>
                </div>
                {showGuide && <Sidebar />}
                <div className={`desktop-search ${showMobileSearch ? "mobile-active" : ""}`}>
                    <Search />
                </div>
                <div className="search-mobile-icon" onClick={() => setShowMobileSearch(true)}>
                    <img src="https://img.icons8.com/?size=100&id=7695&format=png&color=FFFFFF" alt="search" loading="lazy"/>
                </div>
                {showMobileSearch && (
                    <div className="mobile-search-overlay">
                        <Search />
                        <button className="close-mobile-search" onClick={() => setShowMobileSearch(false)}>
                            ✕
                        </button>
                    </div>)}
                <div className="create-group" onClick={() => setShowCreate(!showCreate)} style={{ display: isLoggedIn && user?.channels?.length > 0 ? "flex" : "none" }}>
                    <img src="https://img.icons8.com/?size=100&id=11153&format=png&color=FFFFFF" alt="create" loading="lazy"/>
                    <span>Create</span>
                    <div className="create-options" style={{ display: showCreate ? "block" : "none" }}>
                        <div className="upload-video option" onClick={() => navigate("/channel/manage?upload=true")}>
                            <img src="https://img.icons8.com/?size=100&id=111348&format=png&color=FFFFFF" alt="upload-video" loading="lazy"/>
                            <span>Upload Video</span>
                        </div>
                        <div className="go-live option">
                            <img src="https://img.icons8.com/?size=100&id=ye3pWzAxNYw3&format=png&color=FFFFFF" alt="go-live" loading="lazy"/>
                            <span>Go Live</span>
                        </div>
                        <div className="create-post option">
                            <img src="https://img.icons8.com/?size=100&id=Isc1rCN9qu0y&format=png&color=FFFFFF" alt="create-post" loading="lazy"/>
                            <span>Create Post</span>
                        </div>
                    </div>
                </div>
                <div className="header-sign-in">
                    {isLoggedIn ? <img src={user?.avatar} alt="avatar" className="header-avatar" onClick={() => setShowProfile(!showProfile)} loading="lazy"/> : <Link to="/login" className="signin-btn">
                        <img src="https://img.icons8.com/?size=100&id=23400&format=png&color=FFFFFF" alt="person" loading="lazy"/>
                        <p>Sign in</p>
                    </Link>}
                    <div className="user-profile" style={{ display: showProfile ? "flex" : "none" }}>
                        <div className="profile">
                            <img src={user?.avatar} alt="avatar" className="header-avatar" loading="lazy"/>
                            <div className="user-details">
                                <span>{user?.name}</span>
                                <span>{user?.username}</span>
                                <span onClick={() => setShowProfile(!showProfile)}>{user?.channels?.length === 0 ? <Link to="/channel/create">Create a new channel</Link> : <Link to={`/channel/manage`}>Manage your channel</Link>}</span>
                            </div>
                        </div>
                        <button
                            className="logout-btn"
                            onClick={() => {
                                dispatch(logout());
                                setShowProfile(!showProfile)
                                toast.success("Have a good day!", { icon: "✨" })
                                navigate("/")
                            }}>Logout</button>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Header