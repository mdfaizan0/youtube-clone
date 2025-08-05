export async function getProfile(token) {
    // check if token exist, if not, stop execution
    if (!token) return null;

    try {
        // if token exist, call backend and get user details
        const res = await fetch("http://localhost:5000/api/auth/profile", {
            method: "GET",
            headers: {
                "Content-type": "application/json",
                "authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        // check if response is 401/403, if yes, respond with expired
        if (res.status === 401 || res.status === 403) {
            return { expired: true };
        }

        // if response is clear, proceed to respond with user details
        return { user: data.user };
    } catch (error) {
        // if any error, show on console
        console.error("Error fetching profile:", error.message);
        return null;
    }
}