import { useState } from "react"
import { useNavigate } from "react-router-dom"

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
            const res = await fetch("http://localhost:5000/api/auth/register", {
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
        <div className="signup-page">
            <h1>Sign Up</h1>
            <form onSubmit={handleSignUp}>
                <div className="signup-name">
                    <label htmlFor="name">Name: </label>
                    <input
                        type="text"
                        id="name"
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="signup-username">
                    <label htmlFor="username">Username: </label>
                    <input
                        type="text"
                        id="username"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="signup-email">
                    <label htmlFor="email">Email: </label>
                    <input
                        type="email"
                        id="email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="signup-password">
                    <label htmlFor="password">Password: </label>
                    <input
                        type="password"
                        id="password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="signup-consent">
                    <input
                        type="checkbox"
                        id="consent"
                        onChange={(e) => setConsent(e.target.checked)}
                        required
                    />
                    <label
                        htmlFor="consent"
                    >License Agreement</label>
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default SignUp