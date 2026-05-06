import * as EventService from "../services/event.service.js";
import { fromDoc } from "../models/util.js";

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
		res.status(201).json(fromDoc(event));
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
		res.status(200).json(events.map(fromDoc));
	} catch (error) {
		console.error("[getMyEvents] Error fetching my events:", error);
		res.status(500).json({ message: "Error fetching my events" });
	}
};
