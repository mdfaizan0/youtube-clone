import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

function MobileNav() {
    // getting user and token from redux
    const user = useSelector(state => state?.user?.user)
    const token = useSelector(state => state?.user?.token)

    return (
        <div className="mobile-nav">
            <Link to="/" className="mobile-nav-icon home">
                <img src="https://img.icons8.com/?size=100&id=1iF9PyJ2Thzo&format=png&color=FFFFFF" alt="home-icon" loading="lazy"/>
                <span>Home</span>
            </Link>
            <div className="mobile-nav-icon shorts">
                <img src="https://img.icons8.com/?size=100&id=ajczeHCWXbyR&format=png&color=FFFFFF" alt="home-icon" loading="lazy"/>
                <span>Shorts</span>
            </div>
            <div className="mobile-nav-icon subscriptions">
                <img src="https://img.icons8.com/?size=100&id=69171&format=png&color=FFFFFF" alt="home-icon" loading="lazy"/>
                <span>Subscriptions</span>
            </div>
            <Link to={token ? user?.channels?.length !== 0 ? `/channel/manage` : `/channel/create` : `/login`} className="mobile-nav-icon you">
                <img src={token ? user.avatar : "https://img.icons8.com/?size=100&id=23400&format=png&color=FFFFFF"} alt="user-icon" loading="lazy"/>
                <span>You</span>
            </Link>
        </div>
    )
}

export default MobileNav