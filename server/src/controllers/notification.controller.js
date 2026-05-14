import * as NotificationService from "../services/notification.service.js";
import { fromDoc } from "../models/util.js";

export async function listNotifications(req, res) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated" });
		}

		const { page, limit, unreadOnly } = req.query;
		const result = await NotificationService.listForUser(req.user.userId, {
			page,
			limit,
			unreadOnly: unreadOnly === "true",
		});

		return res.json({
			success: true,
			data: {
				...result,
				notifications: result.notifications.map(fromDoc),
			},
		});
	} catch (error) {
		console.error("[listNotifications] Error:", error);
		return res.status(500).json({ success: false, message: "Error fetching notifications" });
	}
}

export async function getUnreadCount(req, res) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated" });
		}
		const count = await NotificationService.getUnreadCount(req.user.userId);
		return res.json({ success: true, data: { unreadCount: count } });
	} catch (error) {
		console.error("[getUnreadCount] Error:", error);
		return res.status(500).json({ success: false, message: "Error fetching unread count" });
	}
}

export async function markAsRead(req, res) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated" });
		}
		const { id } = req.params;
		const notification = await NotificationService.markAsRead(id, req.user.userId);
		return res.json({ success: true, data: fromDoc(notification.toObject()) });
	} catch (error) {
		if (error.code === "NOT_FOUND") {
			return res.status(404).json({ success: false, message: "Notification not found" });
		}
		console.error("[markAsRead] Error:", error);
		return res.status(500).json({ success: false, message: "Error marking notification as read" });
	}
}

export async function markAllAsRead(req, res) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated" });
		}
		const result = await NotificationService.markAllAsRead(req.user.userId);
		return res.json({ success: true, data: result });
	} catch (error) {
		console.error("[markAllAsRead] Error:", error);
		return res.status(500).json({ success: false, message: "Error marking notifications as read" });
	}
}

export async function deleteNotification(req, res) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated" });
		}
		const { id } = req.params;
		const result = await NotificationService.deleteNotification(id, req.user.userId);
		return res.json({ success: true, data: result });
	} catch (error) {
		if (error.code === "NOT_FOUND") {
			return res.status(404).json({ success: false, message: "Notification not found" });
		}
		console.error("[deleteNotification] Error:", error);
		return res.status(500).json({ success: false, message: "Error deleting notification" });
	}
}
