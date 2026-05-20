import { Router } from "express";
import {
	triggerHostFeedback,
	submitFeedback,
	getFeedbackSummary,
	getMyFeedback,
} from "../controllers/feedback.controller.js";
import { authenticate, optionalAuthenticate } from "../middleware/auth.middleware.js";

export const feedbackRouter = Router();

feedbackRouter.post("/events/:id/feedback/host-trigger", authenticate, triggerHostFeedback);
feedbackRouter.post("/events/:id/feedback", authenticate, submitFeedback);
feedbackRouter.get("/events/:id/feedback/mine", authenticate, getMyFeedback);
feedbackRouter.get("/events/:id/feedback", optionalAuthenticate, getFeedbackSummary);
