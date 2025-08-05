import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import "../utils/style.css"
import { setToken, setUser } from "../utils/userSlice"
import { useDispatch, useSelector } from "react-redux"

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const token = useSelector(state => state.user.token)

    if (token) {
        return <Navigate to="/"></Navigate>
    }

    async function handleLogin(e) {
        e.preventDefault()

        if (!email || !password) {
            alert("Please fill all fields.")
            return
        }

        try {
            const res = await fetch("http://localhost:5000/api/auth/signin", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ email, password })
            })
            if (!res.ok) {
                alert(data.message || "Login failed");
                return;
            }
            const data = await res.json()
            console.log(data)
            dispatch(setUser(data.user))
            dispatch(setToken(data.token))
            navigate("/")
        } catch (error) {
            console.error("Error while logging in", error)
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