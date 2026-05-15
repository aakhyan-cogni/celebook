import * as EventService from "../services/event.service.js";
import { fromDoc } from "../models/util.js";
import { EventModel, EventStatModel } from "../models/index.js";
import fs from "fs";
import path from "path";

export const getEvents = async (req, res) => {
	try {
		const { q, category, location, dateFrom, dateTo, page, limit } = req.query;
		const result = await EventService.getAllEvents({ q, category, location, dateFrom, dateTo, page, limit });
		res.status(200).json(result);
	} catch (error) {
		console.error("[getEvents] Error fetching events:", error);
		res.status(500).json({ message: "Error fetching events" });
	}
};

export const getEventById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await EventService.getEventById(id, req.user);
		if (result.error) {
			const status = result.error === "NOT_FOUND" ? 404 : result.error === "UNAUTHORIZED" ? 401 : 403;
			return res.status(status).json({ message: result.error });
		}
		res.status(200).json(fromDoc(result.event));
	} catch (error) {
		console.error("[getEventById] Error fetching event:", error);
		res.status(500).json({ message: "Error fetching event" });
	}
};

export const createEvent = async (req, res) => {
	try {
		const event = await EventService.createEvent(req.user.userId, req.user.email, req.body);
		res.status(201).json(fromDoc(event.toObject()));
	} catch (error) {
		console.error("[createEvent] Error creating event:", error);
		res.status(500).json({ message: "Error creating event" });
	}
};

export const updateEvent = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await EventService.updateEvent(id, req.user.userId, req.body, req.user.role === "ADMIN");
		if (result.error) {
			const status =
				result.error === "NOT_FOUND" ? 404
					: result.error === "FORBIDDEN" ? 403
						: 400;
			return res.status(status).json({ message: result.error });
		}
		res.status(200).json(fromDoc(result.event));
	} catch (error) {
		console.error("[updateEvent] Error updating event:", error);
		res.status(500).json({ message: "Error updating event" });
	}
};

export const deleteEvent = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await EventService.deleteEvent(id, req.user.userId, req.user.role === "ADMIN");
		if (result.error) {
			const status = result.error === "NOT_FOUND" ? 404 : result.error === "FORBIDDEN" ? 403 : result.error === "HAS_REGISTRATIONS" ? 409 : 400;
			return res.status(status).json({ message: result.error });
		}
		res.status(200).json({ message: "Event deleted successfully" });
	} catch (error) {
		console.error("[deleteEvent] Error deleting event:", error);
		res.status(500).json({ message: "Error deleting event" });
	}
};

export const publishEvent = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await EventService.publishEvent(id, req.user.userId, req.user.role === "ADMIN");
		if (result.error) {
			const status = result.error === "NOT_FOUND" ? 404 : result.error === "FORBIDDEN" ? 403 : result.error === "NOT_PUBLISHABLE" ? 400 : result.error === "TIER_LIMIT_EXCEEDED" ? 403 : 400;
			return res.status(status).json({ message: result.error });
		}
		res.status(200).json(fromDoc(result.event));
	} catch (error) {
		console.error("[publishEvent] Error publishing event:", error);
		res.status(500).json({ message: "Error publishing event" });
	}
};

export const cancelEvent = async (req, res) => {
	try {
		const { id } = req.params;
		const { reason } = req.body;
		const result = await EventService.cancelEvent(id, req.user.userId, reason, req.user.role === "ADMIN");
		if (result.error) {
			const status = result.error === "NOT_FOUND" ? 404 : result.error === "FORBIDDEN" ? 403 : 400;
			return res.status(status).json({ message: result.error });
		}
		res.status(200).json(fromDoc(result.event));
	} catch (error) {
		console.error("[cancelEvent] Error cancelling event:", error);
		res.status(500).json({ message: "Error cancelling event" });
	}
};

export const duplicateEvent = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await EventService.duplicateEvent(id, req.user.userId, req.user.role === "ADMIN");
		if (result.error) {
			const status = result.error === "NOT_FOUND" ? 404 : result.error === "FORBIDDEN" ? 403 : 400;
			return res.status(status).json({ message: result.error });
		}
		res.status(201).json(fromDoc(result.event));
	} catch (error) {
		console.error("[duplicateEvent] Error duplicating event:", error);
		res.status(500).json({ message: "Error duplicating event" });
	}
};

export const getMyEvents = async (req, res) => {
	try {
		const events = await EventService.getMyEvents(req.user.userId);
		
		const normalised = events.map((e) => ({
			id: e._id?.toString(),
			...e,
			_id: undefined,
			__v: undefined,
		}));
		res.status(200).json(normalised);
	} catch (error) {
		console.error("[getMyEvents] Error fetching my events:", error);
		res.status(500).json({ message: "Error fetching my events" });
	}
};


export const getEventStats = async (req, res) => {
	try {
		const { id } = req.params;
		const event = await EventModel.findById(id);
		if (!event) return res.status(404).json({ message: "Event not found" });

		const isOrganizer = event.organizerId.toString() === req.user.userId;
		const isAdmin = req.user.role === "ADMIN";
		if (!isOrganizer && !isAdmin) {
			return res.status(403).json({ message: "Forbidden" });
		}

		const stat = await EventStatModel.findOne({ eventId: event._id });
		res.status(200).json(stat ?? null);
	} catch (error) {
		console.error("[getEventStats] Error:", error);
		res.status(500).json({ message: "Error fetching event stats" });
	}
};

const TIER_IMAGE_LIMITS = { FREE: 1, PRO: 5, ULTIMATE: 10 };

export const uploadEventImages = async (req, res) => {
	try {
		if (!req.files || req.files.length === 0) {
			return res.status(400).json({ message: "No files uploaded" });
		}

		const { id } = req.params;
		const event = await EventModel.findById(id);
		if (!event) return res.status(404).json({ message: "Event not found" });

		const isOrganizer = event.organizerId.toString() === req.user.userId;
		const isAdmin = req.user.role === "ADMIN";
		if (!isOrganizer && !isAdmin) {
			return res.status(403).json({ message: "Only the organizer or admin can upload images" });
		}

		// Tier limit check
		const userTier = req.user.tier ?? "FREE";
		const limit = TIER_IMAGE_LIMITS[userTier] ?? 1;
		const currentCount = event.imgUrls?.length ?? 0;
		if (currentCount + req.files.length > limit) {
			return res.status(403).json({
				message: `Your ${userTier} plan allows at most ${limit} image(s). You already have ${currentCount}.`,
			});
		}

		const newUrls = req.files.map((f) => `/uploads/events/${f.filename}`);
		event.imgUrls = [...(event.imgUrls ?? []), ...newUrls];
		await event.save();

		res.status(200).json({ imgUrls: event.imgUrls });
	} catch (error) {
		console.error("[uploadEventImages] Error:", error);
		res.status(500).json({ message: "Image upload failed" });
	}
};

export const deleteEventImage = async (req, res) => {
	try {
		const { id } = req.params;
		const { url } = req.body;

		if (!url) return res.status(400).json({ message: "url is required in the request body" });

		const event = await EventModel.findById(id);
		if (!event) return res.status(404).json({ message: "Event not found" });

		const isOrganizer = event.organizerId.toString() === req.user.userId;
		const isAdmin = req.user.role === "ADMIN";
		if (!isOrganizer && !isAdmin) {
			return res.status(403).json({ message: "Only the organizer or admin can delete images" });
		}
		event.imgUrls = (event.imgUrls ?? []).filter((u) => u !== url);
		await event.save();
		try {
			const filePath = path.join("public", url);
			if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
		} catch (_) {
			// ignore fs errors
		}

		res.status(200).json({ imgUrls: event.imgUrls });
	} catch (error) {
		console.error("[deleteEventImage] Error:", error);
		res.status(500).json({ message: "Image deletion failed" });
	}
};
