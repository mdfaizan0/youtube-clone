import { Link } from "react-router-dom"

// static guide on home page only
function GuideAside() {
    return (
        <aside className="guide-aside">
            <Link to="/" className="aside-home aside">
                <img src="https://img.icons8.com/?size=100&id=1iF9PyJ2Thzo&format=png&color=FFFFFF" alt="aside-home" />
                <span>Home</span>
            </Link>
            <div className="aside-shorts aside">
                <img src="https://img.icons8.com/?size=100&id=ajczeHCWXbyR&format=png&color=FFFFFF" alt="aside-shorts" />
                <span>Shorts</span>
            </div>
            <div className="aside-subs aside">
                <img src="https://img.icons8.com/?size=100&id=69171&format=png&color=FFFFFF" alt="aside-subs" />
                <span>Subscriptions</span>
            </div>
            <div className="aside-you aside">
                <img src="https://img.icons8.com/?size=100&id=23400&format=png&color=FFFFFF" alt="aside-you" />
                <span>You</span>
            </div>
            <div className="aside-history aside">
                <img src="https://img.icons8.com/?size=100&id=86136&format=png&color=FFFFFF" alt="aside-history" />
                <span>History</span>
            </div>
        </aside>
    )
}

export default GuideAside