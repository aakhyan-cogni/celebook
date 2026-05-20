import { Router } from "express";
import { createFeedback } from "../controllers/appFeedback.controller.js";
import { authenticate } from "../middleware/auth.middleware.js"; 

export const appFeedbackRouter = Router();

appFeedbackRouter.post("/", authenticate, createFeedback);