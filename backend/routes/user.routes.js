import { signInUser, signUpUser } from "../controllers/auth.controller.js";
import { Router } from "express";

const userRouter = Router()

userRouter.post("/signup", signUpUser)
userRouter.post("/signin", signInUser)

export default userRouter