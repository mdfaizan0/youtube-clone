import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice.js"

// configuring redux store
const appStore = configureStore({
    reducer: {
        user: userReducer
    }
})

export default appStore