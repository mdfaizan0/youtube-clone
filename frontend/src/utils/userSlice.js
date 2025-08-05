import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        token: localStorage.getItem("token") || null,
        user: null
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        },
        setToken: (state, action) => {
            state.token = action.payload
            localStorage.setItem("token", action.payload)
        },
        logout: (state) => {
            state.token = null
            state.user = null
            localStorage.removeItem("token")
        }
    }
})

export const { setUser, setToken, logout } = userSlice.actions

export default userSlice.reducer