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
} from "../controllers/event.controller.js";
import { registerForEvent, cancelRegistration, getEventRegistrations } from "../controllers/registration.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { consentCheck } from "../middleware/consent.middleware.js";
import { eventImageUpload } from "../lib/upload.js";

export const eventRouter = Router();

eventRouter.post("/", authenticate, consentCheck, createEvent);
eventRouter.post("/:id/publish", authenticate, consentCheck, publishEvent);
eventRouter.post("/:id/cancel", authenticate, cancelEvent);
eventRouter.post("/:id/duplicate", authenticate, duplicateEvent);
eventRouter.post("/:id/register", authenticate, consentCheck, registerForEvent);
eventRouter.post("/:id/images", authenticate, eventImageUpload.array("images", 10), uploadEventImages);
eventRouter.patch("/:id", authenticate, updateEvent);
eventRouter.delete("/:id", authenticate, deleteEvent);
eventRouter.delete("/:id/register", authenticate, cancelRegistration);
eventRouter.delete("/:id/images", authenticate, deleteEventImage);
eventRouter.get("/mine", authenticate, getMyEvents);              
eventRouter.get("/:id/registrations", authenticate, getEventRegistrations);
eventRouter.get("/:id", getEventById);
eventRouter.get("/", getEvents);
