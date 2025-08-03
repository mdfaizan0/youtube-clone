import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../utils/style.css"

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

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
            const data = await res.json()
            console.log(data)
            localStorage.setItem("token", data.token)
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
                    <input type="email" id="email" required onChange={(e) => setEmail(e.target.value)} />
                    <label htmlFor="email">Email</label>
                </div>
                <div className="input-group">
                    <input type="password" id="password" required onChange={(e) => setPassword(e.target.value)} />
                    <label htmlFor="password">Password</label>
                </div>
                <button type="submit" className="login-button">Log In</button>
            </form>
            <div className="signup-login">
                <span>Don't have an account? <Link to="/signup">Create your account</Link></span>
            </div>
        </div>
    )
}

export default Login