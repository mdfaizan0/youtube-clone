import { useEffect, useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import "../utils/style.css"
import { setToken, setUser } from "../utils/userSlice"
import { useDispatch, useSelector } from "react-redux"
import toast from "react-hot-toast"
import { SIGNIN } from "../utils/API_CONFIG"

function Login() {
    useEffect(() => {
        document.title = "Sign in - YouTube"
    }, [])

    // setting states, getting rrd hooks and getting token state from redux
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const token = useSelector(state => state.user.token)

    // if token is there, navigate to home
    if (token) {
        return <Navigate to="/"></Navigate>
    }

    // handling login form submission
    async function handleLogin(e) {
        e.preventDefault()

        // checking if both fields are filled
        if (!email || !password) {
            toast("Please fill all fields.")
            return
        }
        // if yes, sending data to BE
        try {
            const res = await fetch(SIGNIN, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ email, password })
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data?.message || "Login failed");
                return;
            }
            // if response is 200, setting user details to user state and token to user/token states and routing to home with a custom toast
            if (res.status === 200) {
                dispatch(setUser(data.user))
                dispatch(setToken(data.token))
                toast.success(`Welcome Back, ${data.user.name.split(" ")[0]}`, { icon: "👋🏻" })
                navigate("/")
                // if response status is 404 or 401, show backend sent message as toast
            } else if (res.status === 404 || res.status === 401) {
                toast(data.message)
            } else {
                // if anything else, show as toast
                toast(data.message || "Login failed")
            }
        } catch (error) {
            console.error("Error while logging in", error)
            toast.error(error.message)
        }
    }

    return (
        <div className="login-container">
            <h1 className="login-title">Welcome Back</h1>
            <form onSubmit={handleLogin} className="login-form">
                <div className="input-group">
                    <input type="email" id="email" required onChange={(e) => setEmail(e.target.value)} placeholder=" " />
                    <label htmlFor="email">Email</label>
                </div>
                <div className="input-group">
                    <input type="password" id="password" required onChange={(e) => setPassword(e.target.value)} placeholder=" " />
                    <label htmlFor="password">Password</label>
                </div>
                <button type="submit" className="login-button">Sign In</button>
            </form>
            <div className="signup-login">
                <span>Don't have an account? <Link to="/signup">Create your account</Link></span>
            </div>
        </div>
    )
}

export default Login