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
import { registerForEvent, cancelRegistration, getEventRegistrations } from "../controllers/registration.controller.js";
import { authenticate, optionalAuthenticate } from "../middleware/auth.middleware.js";
import { consentCheck } from "../middleware/consent.middleware.js";
import { eventImageUpload } from "../lib/upload.js";

export const eventRouter = Router();

eventRouter.post("/",              authenticate, consentCheck, createEvent);
eventRouter.post("/:id/publish",   authenticate, consentCheck, publishEvent);
eventRouter.patch("/:id",          authenticate, consentCheck, updateEvent);
eventRouter.post("/:id/cancel",    authenticate, cancelEvent);
eventRouter.post("/:id/duplicate", authenticate, duplicateEvent);
eventRouter.post("/:id/register",  authenticate, consentCheck, registerForEvent);
eventRouter.post("/:id/images",    authenticate, eventImageUpload.array("images", 10), uploadEventImages);
eventRouter.delete("/:id",         authenticate, deleteEvent);
eventRouter.delete("/:id/register", authenticate, cancelRegistration);
eventRouter.delete("/:id/images",  authenticate, deleteEventImage);

eventRouter.get("/mine",              authenticate, getMyEvents);
eventRouter.get("/can-publish",       authenticate, checkPublishEligibility);
eventRouter.get("/:id/registrations", authenticate, getEventRegistrations);
eventRouter.get("/:id/stats",         authenticate, getEventStats);

eventRouter.get("/:id",               optionalAuthenticate, getEventById);
eventRouter.get("/",                  getEvents);
