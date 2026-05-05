import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import * as UserController from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.get("/profile", authenticate, UserController.getUserProfile);
userRouter.patch("/profile", authenticate, UserController.updateUser);
