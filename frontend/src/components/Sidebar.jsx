import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { logout } from "../utils/userSlice";
import toast from "react-hot-toast";

function Sidebar() {
    // getting token and user from redux, dispatch and navigate from rrd
    const token = useSelector(state => state.user.token)
    const user = useSelector(state => state.user.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    return (
        <aside className="guide-sidebar">
            <div className="home-actions sideblock">
                <Link to="/" className="sidebar-home side">
                    <img src="https://img.icons8.com/?size=100&id=1iF9PyJ2Thzo&format=png&color=FFFFFF" alt="sidebar-home" loading="lazy"/>
                    <span>Home</span>
                </Link>
                <div className="sidebar-shorts side">
                    <img src="https://img.icons8.com/?size=100&id=ajczeHCWXbyR&format=png&color=FFFFFF" alt="sidebar-shorts" loading="lazy"/>
                    <span>Shorts</span>
                </div>
                <div className="sidebar-subs side">
                    <img src="https://img.icons8.com/?size=100&id=69171&format=png&color=FFFFFF" alt="sidebar-subs" loading="lazy"/>
                    <span>Subscriptions</span>
                </div>
            </div>
            <div className="personal-actions sideblock">
                <div className="side sidebar-logout " onClick={() => {
                    if (token) {
                        dispatch(logout())
                        toast.success("Have a good day!", { icon: "✨" })
                        navigate("/")
                    } else {
                        navigate("/login")
                    }
                }}>
                    <img src={token ? "https://img.icons8.com/?size=100&id=82792&format=png&color=FFFFFF" : "https://img.icons8.com/?size=100&id=61050&format=png&color=FFFFFF"} alt="sidebar-logout" loading="lazy"/>
                    <span>{token ? "Logout" : "Login"}</span>
                </div>
                <Link to={token ? user?.channels?.length !== 0 ? `/channel/manage` : `/channel/create` : `/login`} className="side sidebar-you">
                    <img src={token ? user.avatar : "https://img.icons8.com/?size=100&id=23400&format=png&color=FFFFFF"} alt="home-icon" loading="lazy"/>
                    <span>You</span>
                </Link>
                <div className="side sidebar-history">
                    <img src="https://img.icons8.com/?size=100&id=86136&format=png&color=FFFFFF" alt="sidebar-history" loading="lazy"/>
                    <span>History</span>
                </div>
            </div>
            <div className="signin-cta-sidebar sideblock" style={{ display: token ? "none" : "flex" }}>
                <span>Sign in to like videos, comment, and subscribe.</span>
                <Link to="/login" className="signin-btn">
                    <img src="https://img.icons8.com/?size=100&id=23400&format=png&color=FFFFFF" alt="person" loading="lazy"/>
                    <p>Sign in</p>
                </Link>
            </div>
            <div className="explore-sidebar sideblock">
                <h2>Explore</h2>
                <div className="sidebar-explore">
                    <div className="side explore-shopping">
                        <img src="https://img.icons8.com/?size=100&id=22167&format=png&color=FFFFFF" alt="sidebar-explore-option" loading="lazy"/>
                        <span>Shopping</span>
                    </div>
                    <div className="side explore-music">
                        <img src="https://img.icons8.com/?size=100&id=59845&format=png&color=FFFFFF" alt="sidebar-explore-option" loading="lazy"/>
                        <span>Music</span>
                    </div>
                    <div className="side explore-movies">
                        <img src="https://img.icons8.com/?size=100&id=2998&format=png&color=FFFFFF" alt="sidebar-explore-option" loading="lazy"/>
                        <span>Movies</span>
                    </div>
                    <div className="side explore-live">
                        <img src="https://img.icons8.com/?size=100&id=ye3pWzAxNYw3&format=png&color=FFFFFF" alt="sidebar-explore-option" loading="lazy"/>
                        <span>Live</span>
                    </div>
                    <div className="side explore-gaming">
                        <img src="https://img.icons8.com/?size=100&id=85456&format=png&color=FFFFFF" alt="sidebar-explore-option" loading="lazy"/>
                        <span>Gaming</span>
                    </div>
                    <div className="side explore-news">
                        <img src="https://img.icons8.com/?size=100&id=82755&format=png&color=FFFFFF" alt="sidebar-explore-option" loading="lazy"/>
                        <span>News</span>
                    </div>
                    <div className="side explore-sports">
                        <img src="https://img.icons8.com/?size=100&id=85613&format=png&color=FFFFFF" alt="sidebar-explore-option" loading="lazy"/>
                        <span>Sports</span>
                    </div>
                    <div className="side explore-Courses">
                        <img src="https://img.icons8.com/?size=100&id=RrEzD0dgGJgW&format=png&color=FFFFFF" alt="sidebar-explore-option" loading="lazy"/>
                        <span>Courses</span>
                    </div>
                    <div className="side explore-fash">
                        <img src="https://img.icons8.com/?size=100&id=g2UsITAUAT9C&format=png&color=FFFFFF" alt="sidebar-explore-option" loading="lazy"/>
                        <span>Fashion & Beauty</span>
                    </div>
                    <div className="side explore-podcast">
                        <img src="https://img.icons8.com/?size=100&id=59741&format=png&color=FFFFFF" alt="sidebar-explore-option" loading="lazy"/>
                        <span>Podcasts</span>
                    </div>
                </div>
            </div>
            <div className="more-from-yt sideblock">
                <h2>More from YouTube</h2>
                <div className="sidebar-more">
                    <div className="side yt-premium">
                        <img src="https://img.icons8.com/?size=100&id=19318&format=png&color=000000" alt="yt-premium" loading="lazy"/>
                        <span>YouTube Premium</span>
                    </div>
                    <div className="side yt-music">
                        <img src="https://img.icons8.com/?size=100&id=V1cbDThDpbRc&format=png&color=000000" alt="yt-music" loading="lazy"/>
                        <span>YouTube Music</span>
                    </div>
                    <div className="side yt-kids">
                        <img src="https://img.icons8.com/?size=100&id=szxM3fi4e37N&format=png&color=000000" alt="yt-kids" loading="lazy"/>
                        <span>YouTube Kids</span>
                    </div>
                </div>
            </div>
            <div className="account-actions sideblock">
                <div className="side account-setting">
                    <img src="https://img.icons8.com/?size=100&id=364&format=png&color=FFFFFF" alt="ccount-setting" loading="lazy"/>
                    <span>Settings</span>
                </div>
                <div className="side account-report">
                    <img src="https://img.icons8.com/?size=100&id=K4jLy6sZ7yfc&format=png&color=FFFFFF" alt="account-report" loading="lazy"/>
                    <span>Report history</span>
                </div>
                <div className="side account-help">
                    <img src="https://img.icons8.com/?size=100&id=646&format=png&color=FFFFFF" alt="account-help" loading="lazy"/>
                    <span>Help</span>
                </div>
                <div className="side account-feedback">
                    <img src="https://img.icons8.com/?size=100&id=22034&format=png&color=FFFFFF" alt="account-feedback" loading="lazy"/>
                    <span>Send Feedback</span>
                </div>
            </div>
            <div className="footer">
                <div className="guide-links-primary">
                    <a slot="guide-links-primary" href="https://www.youtube.com/about/" >About</a>
                    <a slot="guide-links-primary" href="https://www.youtube.com/about/press/" >Press</a>
                    <a slot="guide-links-primary" href="https://www.youtube.com/about/copyright/" >Copyright</a>
                    <a slot="guide-links-primary" href="/t/contact_us/" >Contact us</a>
                    <a slot="guide-links-primary" href="https://www.youtube.com/creators/" >Creators</a>
                    <a slot="guide-links-primary" href="https://www.youtube.com/ads/" >Advertise</a>
                    <a slot="guide-links-primary" href="https://developers.google.com/youtube" >Developers</a>
                </div>
                <div className="guide-links-secondary">
                    <a slot="guide-links-secondary" href="/t/terms" >Terms</a>
                    <a slot="guide-links-secondary" href="/t/privacy" >Privacy</a>
                    <a slot="guide-links-secondary" href="https://www.youtube.com/about/policies/" >Policy &amp; Safety</a>
                    <a slot="guide-links-secondary" href="https://www.youtube.com/howyoutubeworks/" >How YouTube works</a>
                    <a slot="guide-links-secondary" href="/new" >Test new features</a>
                </div>
                <div id="copyright" slot="copyright" >© 2025 Md Faizan</div>
            </div>
        </aside>
    )
}

export default Sidebar