import { Router } from "express";
import * as AuthController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.post("/refresh", AuthController.refresh);
authRouter.post("/logout", AuthController.logout);

// /auth/me is the probe used to detect stale consent. It must remain
// reachable even when the user's consentVersion is stale.
authRouter.get("/me", authenticate, AuthController.me);
