import { EventModel } from "../models/index.js";
import * as RegistrationService from "../services/registration.service.js";

export async function registerForEvent(req, res) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated" });
		}

		const { id: eventId } = req.params;
		const userId = req.user.userId;
		const { formData = {} } = req.body;

		if (!eventId) {
			return res.status(400).json({ message: "Event ID is required" });
		}

		const result = await RegistrationService.registerForEvent(eventId, userId, formData);

		return res.status(201).json({
			success: true,
			message: "Successfully registered for event",
			data: result,
		});
	} catch (error) {
		console.error("[registerForEvent] Error:", error);

		if (error.code === "ALREADY_REGISTERED") {
			return res.status(409).json({
				success: false,
				error: "ALREADY_REGISTERED",
				message: error.message,
			});
		}

		if (
			error.code === "EVENT_NOT_FOUND" ||
			error.code === "EVENT_NOT_APPROVED" ||
			error.code === "EVENT_CANCELLED" ||
			error.code === "TEAM_EVENT" ||
			error.code === "EVENT_FULL"
		) {
			return res.status(400).json({
				success: false,
				code: error.code,
				message: error.message,
			});
		}

		return res.status(500).json({
			success: false,
			message: "Error registering for event",
		});
	}
}

export async function cancelRegistration(req, res) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated" });
		}

		const { id: eventId } = req.params;
		const userId = req.user.userId;

		if (!eventId) {
			return res.status(400).json({ message: "Event ID is required" });
		}

		const registration = await RegistrationService.cancelRegistration(eventId, userId);

		return res.json({
			success: true,
			message: "Registration cancelled successfully",
			data: registration,
		});
	} catch (error) {
		console.error("[cancelRegistration] Error:", error);

		if (error.code === "TOO_LATE_TO_CANCEL") {
			return res.status(400).json({
				success: false,
				error: "TOO_LATE_TO_CANCEL",
				message: error.message,
			});
		}

		if (error.code === "REGISTRATION_NOT_FOUND" || error.code === "EVENT_NOT_FOUND") {
			return res.status(404).json({
				success: false,
				code: error.code,
				message: error.message,
			});
		}

		return res.status(500).json({
			success: false,
			message: "Error cancelling registration",
		});
	}
}

export async function getEventRegistrations(req, res) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated" });
		}

		const { id: eventId } = req.params;

		if (!eventId) {
			return res.status(400).json({ message: "Event ID is required" });
		}

		// Check if user is organizer or admin
		const event = await EventModel.findById(eventId);
		if (!event) {
			return res.status(404).json({ message: "Event not found" });
		}

		const isOrganizer = event.organizerId.toString() === req.user.userId.toString();
		const isAdmin = req.user.role === "ADMIN";

		if (!isOrganizer && !isAdmin) {
			return res.status(403).json({
				success: false,
				message: "Forbidden: only organizer or admin can view registrations",
			});
		}

		const registrations = await RegistrationService.getEventRegistrations(eventId);

		return res.json({
			success: true,
			data: registrations,
		});
	} catch (error) {
		console.error("[getEventRegistrations] Error:", error);
		return res.status(500).json({
			success: false,
			message: "Error fetching event registrations",
		});
	}
}

export async function getMyRegistrations(req, res) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated" });
		}

		const registrations = await RegistrationService.getMyRegistrations(req.user.userId);

		return res.json({
			success: true,
			data: registrations,
		});
	} catch (error) {
		console.error("[getMyRegistrations] Error:", error);
		return res.status(500).json({
			success: false,
			message: "Error fetching registrations",
		});
	}
}
