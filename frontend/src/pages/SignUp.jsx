import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../utils/style.css"

function SignUp() {
    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [consent, setConsent] = useState(false)
    const navigate = useNavigate()

    async function handleSignUp(e) {
        e.preventDefault()
        if (!name || !email || !password || !username) {
            alert("Please fill all fields")
            return
        }

        try {
            const res = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ name, username, email, password, consent })
            })
            const data = await res.json()
            console.log(data)
            navigate("/login")
        } catch (error) {
            console.error("Error while registering user", error)
        }
    }
    return (
        <div className="signup-container">
            <h1 className="signup-title">Create your account</h1>
            <form onSubmit={handleSignUp} className="signup-form">
                <div className="input-group">
                    <input type="text" id="name" required onChange={(e) => setName(e.target.value)} />
                    <label htmlFor="name">Full Name</label>
                </div>
                <div className="input-group">
                    <input type="text" id="username" required onChange={(e) => setUsername(e.target.value)} />
                    <label htmlFor="username">Username</label>
                </div>
                <div className="input-group">
                    <input type="email" id="email" required onChange={(e) => setEmail(e.target.value)} />
                    <label htmlFor="email">Email</label>
                </div>
                <div className="input-group">
                    <input type="password" id="password" required onChange={(e) => setPassword(e.target.value)} />
                    <label htmlFor="password">Password</label>
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