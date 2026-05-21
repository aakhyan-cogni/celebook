import { Router } from "express";
import {
	createEvent,
	deleteEvent,
	getEventById,
	getEvents,
	getMyEvents,
	publishEvent,
	updateEvent,
	cancelEvent,
	duplicateEvent,
	uploadEventImages,
	deleteEventImage,
	getEventStats,
	checkPublishEligibility,
} from "../controllers/event.controller.js";
import { registerForEvent, cancelRegistration, getEventRegistrations, checkIn } from "../controllers/registration.controller.js";
import { authenticate, optionalAuthenticate } from "../middleware/auth.middleware.js";
import { consentCheck } from "../middleware/consent.middleware.js";
import { eventImageUpload } from "../lib/upload.js";
import { getMyFeedback, submitFeedback, triggerHostFeedback, getFeedbackSummary } from "../controllers/feedback.controller.js";

export const eventRouter = Router();

eventRouter.post("/",              authenticate, consentCheck, createEvent);
eventRouter.post("/:id/publish",   authenticate, consentCheck, publishEvent);
eventRouter.patch("/:id",          authenticate, consentCheck, updateEvent);
eventRouter.post("/:id/cancel",    authenticate, consentCheck, cancelEvent);
eventRouter.post("/:id/duplicate", authenticate, consentCheck, duplicateEvent);
eventRouter.post("/:id/register",  authenticate, consentCheck, registerForEvent);
eventRouter.post("/:id/check-in",  authenticate, consentCheck, checkIn);
eventRouter.post("/:id/images",    authenticate, consentCheck, eventImageUpload.array("images", 10), uploadEventImages);
eventRouter.delete("/:id",         authenticate, consentCheck, deleteEvent);
eventRouter.delete("/:id/register", authenticate, consentCheck, cancelRegistration);
eventRouter.delete("/:id/images",  authenticate, consentCheck, deleteEventImage);

eventRouter.get("/mine",              authenticate, getMyEvents);
eventRouter.get("/can-publish",       authenticate, checkPublishEligibility);
eventRouter.get("/:id/registrations", authenticate, getEventRegistrations);
eventRouter.get("/:id/stats",         authenticate, getEventStats);

eventRouter.post("/:id/feedback/host-trigger", authenticate, consentCheck, triggerHostFeedback);
eventRouter.post("/:id/feedback", authenticate, consentCheck, submitFeedback);
eventRouter.get("/:id/feedback/mine", authenticate, getMyFeedback);
eventRouter.get("/:id/feedback", optionalAuthenticate, getFeedbackSummary);

eventRouter.get("/:id",               optionalAuthenticate, getEventById);
eventRouter.get("/",                  getEvents);
