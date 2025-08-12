import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import "../utils/style.css"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"

function SignUp() {
    // declaring necessary states
    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [consent, setConsent] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState("")
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // getting rrd navigate and token state from redux
    const navigate = useNavigate()
    const token = useSelector(state => state.user.token)

    // if token exist, nav to home
    if (token) {
        return <Navigate to="/"></Navigate>
    }

    // handling cloudinary upload widget for user avatar configuring and calling it
    function handleUploadAvatar() {
        const widget = window.cloudinary.createUploadWidget({
            cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
            uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
            folder: "avatars",
            sources: ["local"],
            cropping: true,
            croppingAspectRatio: 1,
            croppingDefaultSelectionRatio: 0.8,
            croppingShowDimensions: true,
            croppingCoordinatesMode: "custom",
            multiple: false,
            showSkipCropButton: false,
            croppingShowBackButton: true,
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
            maxFileSize: 5 * 1024 * 1024,
            resourceType: "image",
            showCompletedButton: true,
            showUploadMoreButton: false,
            publicId: username ? `avatar_${username}_${Date.now()}` : `avatar_${Date.now()}`,
            styles: {
                palette: {
                    window: "#1c1c1c",
                    sourceBg: "#222222",
                    windowBorder: "#8E9FBF",
                    tabIcon: "#FFFFFF",
                    inactiveTabIcon: "#8E9FBF",
                    menuIcons: "#CCCCCC",
                    link: "#5ACCFF",
                    action: "#FF620C",
                    inProgress: "#00BFFF",
                    complete: "#20B832",
                    error: "#F44235",
                    textDark: "#000000",
                    textLight: "#FFFFFF",
                }
            }
        }, (error, result) => {
            if (error) {
                console.error("Upload error:", error);
                return;
            }
            if (result.event === "success") {
                const url = result.info.secure_url;
                setAvatarUrl(url);
                widget.close();
            }
        });

        if (widget) {
            widget.open();
        }
    }

    // handling signup
    async function handleSignUp(e) {
        e.preventDefault()
        setEmailError("");
        setPasswordError("");

        // email and password regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

        // checking if al fields are filled
        if (!name || !email || !password || !username) {
            toast("Please fill all fields")
            return
        }

        // checking validity of email and password thru regex
        if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address.");
            return;
        }

        if (!passwordRegex.test(password)) {
            setPasswordError("Password must be at least 6 characters and include uppercase, lowercase, and a number.");
            return;
        }

        // sending post request to BE with user details
        try {
            const res = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ name, username, email, password, consent, avatar: avatarUrl })
            })
            const data = await res.json()
            if (res.status === 201) {
                navigate("/login")
                toast.success(`Hello ${name.split(" ")[0]}, welcome to the family, please login`, { icon: "👋🏻" })
                // if response status is 409, show backend given message and navigate to login
            } else if (res.status === 409) {
                toast.error(data.message)
            }
        } catch (error) {
            console.error("Error while registering user", error)
        }
    }

    return (
        <div className="signup-container">
            <h1 className="signup-title">Create your account</h1>
            <form onSubmit={handleSignUp} className="signup-form">
                <div className="avatar-group">
                    <img
                        src={avatarUrl ? avatarUrl : "https://img.icons8.com/?size=100&id=7819&format=png&color=FFFFFF"}
                        alt="avatar preview"
                        className="avatar-preview"
                    />
                    <button type="button" onClick={handleUploadAvatar}>
                        {avatarUrl ? "Change Avatar" : "Upload Avatar"}
                    </button>
                </div>
                <div className="input-group">
                    <input type="text" id="name" required onChange={(e) => setName(e.target.value)} placeholder=" " />
                    <label htmlFor="name">Full Name</label>
                </div>
                <div className="input-group">
                    <input type="text" id="username" required onChange={(e) => setUsername(e.target.value)} placeholder=" " />
                    <label htmlFor="username">Username</label>
                </div>
                <div className="input-group">
                    <input type="email" id="email" autoComplete="off" required onChange={(e) => setEmail(e.target.value)} placeholder=" " />
                    <label htmlFor="email">Email</label>
                    {emailError && <p className="error-text">{emailError}</p>}
                </div>
                <div className="input-group">
                    <input type="password" id="password" autoComplete="off" required onChange={(e) => setPassword(e.target.value)} placeholder=" " />
                    <label htmlFor="password">Password</label>
                    {passwordError && <p className="error-text">{passwordError}</p>}
                </div>
                <div className="consent-group">
                    <input type="checkbox" id="consent" required onChange={(e) => setConsent(e.target.checked)} />
                    <label htmlFor="consent">I agree to the terms & conditions</label>
                </div>
                <button type="submit" className="signup-button">Sign Up</button>
            </form>
            <div className="signup-login">
                <span>Already have an account? <Link to="/login">Login</Link></span>
            </div>
        </div>
    )
}

export default SignUp