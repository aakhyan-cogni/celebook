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
} from "../controllers/event.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { consentCheck } from "../middleware/consent.middleware.js";

export const eventRouter = Router();

eventRouter.post("/", authenticate, consentCheck, createEvent);
eventRouter.patch("/:id", authenticate, updateEvent);
eventRouter.delete("/:id", authenticate, deleteEvent);
eventRouter.post("/:id/publish", authenticate, consentCheck, publishEvent);
eventRouter.post("/:id/cancel", authenticate, cancelEvent);
eventRouter.post("/:id/duplicate", authenticate, duplicateEvent);
eventRouter.get("/mine", authenticate, getMyEvents);
eventRouter.get("/:id", getEventById);
eventRouter.get("/", getEvents);
