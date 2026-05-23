import * as AdminService from "../services/admin.service.js";
import * as ConsentService from "../services/consent.service.js";
import { createNotification } from "../services/notification.service.js";
import { EventModel } from "../models/index.js";

export async function listUsers(req, res) {
	try {
		const page = Math.max(1, parseInt(req.query.page, 10) || 1);
		const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
		const roleParam = req.query.role;
		const role = roleParam === "USER" || roleParam === "ADMIN" ? roleParam : undefined;

		const result = await AdminService.getPaginatedUsers(page, limit, role);
		res.json(result);
	} catch {
		res.status(500).json({ message: "Internal server error" });
	}
}

export async function updateUserRole(req, res) {
	try {
		const { id } = req.params;
		const { role } = req.body;

		if (role !== "USER" && role !== "ADMIN") {
			res.status(400).json({ message: "Invalid role. Must be USER or ADMIN." });
			return;
		}

		const updated = await AdminService.updateUserRole(id, role);
		if (!updated) {
			res.status(404).json({ message: "User not found" });
			return;
		}
		res.json({ message: "Role updated" });
	} catch {
		res.status(500).json({ message: "Internal server error" });
	}
}

export async function listEvents(req, res) {
	try {
		const page = Math.max(1, parseInt(req.query.page, 10) || 1);
		const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
		const status = req.query.status;

		const result = await AdminService.getPaginatedEvents(page, limit, status);
		res.json(result);
	} catch {
		res.status(500).json({ message: "Internal server error" });
	}
}

export async function approveEvent(req, res) {
	try {
		const { id } = req.params;
		const updated = await AdminService.approveEvent(id);
		if (!updated) {
			res.status(404).json({ message: "Event not found" });
			return;
		}

		const event = await EventModel.findById(id).select("organizerId title").lean();
		if (event) {
			createNotification({
				userId: event.organizerId,
				type: "EVENT_APPROVED",
				data: { eventTitle: event.title, eventId: id },
			}).catch((err) => console.error("[approveEvent] notify failed:", err));
		}

		res.json({ message: "Event approved" });
	} catch {
		res.status(500).json({ message: "Internal server error" });
	}
}

export async function rejectEvent(req, res) {
	try {
		const { id } = req.params;
		const { reason } = req.body;
		if (!reason?.trim()) {
			res.status(400).json({ message: "Rejection reason is required" });
			return;
		}

		const updated = await AdminService.rejectEvent(id, reason);
		if (!updated) {
			res.status(404).json({ message: "Event not found" });
			return;
		}

		const event = await EventModel.findById(id).select("organizerId title").lean();
		if (event) {
			createNotification({
				userId: event.organizerId,
				type: "EVENT_REJECTED",
				data: { eventTitle: event.title, eventId: id, rejectionReason: reason },
			}).catch((err) => console.error("[rejectEvent] notify failed:", err));
		}

		res.json({ message: "Event rejected" });
	} catch {
		res.status(500).json({ message: "Internal server error" });
	}
}

export async function getStats(req, res) {
	try {
		const stats = await AdminService.getStats();
		res.json(stats);
	} catch {
		res.status(500).json({ message: "Internal server error" });
	}
}

export async function getTerms(req, res) {
	try {
		const terms = await ConsentService.getCurrentTerms();
		res.json(terms);
	} catch (error) {
		console.error("[getTerms] Error in Admin controller:", error);
		res.status(500).json({ message: "Internal server error" });
	}
}

export async function updateTerms(req, res) {
	try {
		const { version, content } = req.body ?? {};
		const updated = await ConsentService.updateTerms({
			version,
			content,
			publisherUserId: req.user?.userId,
		});
		res.json(updated);
	} catch (error) {
		if (error?.code === "VERSION_INVALID") {
			return res.status(400).json({ message: "Version is required" });
		}
		if (error?.code === "VERSION_UNCHANGED") {
			return res.status(400).json({ message: "New version must differ from current" });
		}
		console.error("[updateTerms] Error in Admin controller:", error);
		res.status(500).json({ message: "Internal server error" });
	}
}
