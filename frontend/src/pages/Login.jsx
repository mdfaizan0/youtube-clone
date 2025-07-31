import { useState } from "react"
import { useNavigate } from "react-router-dom"

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
            const res = await fetch("http://localhost:5000/api/auth/login", {
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
        <div className="login-wrapper">
            <form onSubmit={handleLogin}>
                <div className="login-email">
                    <label htmlFor="email">Email: </label>
                    <input type="email" id="email" onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="login-password">
                    <label htmlFor="password">Password: </label>
                    <input type="password" id="password" onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default Login