import { signInUser, signUpUser, userProfile } from "../controllers/auth.controller.js";
import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";

const userRouter = Router()

// creating routes and adding auth middleware
userRouter.post("/signup", signUpUser)
userRouter.post("/signin", signInUser)
userRouter.get("/profile", protect, userProfile)

export default userRouter