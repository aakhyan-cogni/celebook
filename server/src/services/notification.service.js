import mongoose from "mongoose";
import { NotificationModel, UserModel, EventModel, RegistrationModel } from "../models/index.js";
import { fromDoc } from "../models/util.js";
import { emitToUser } from "../lib/socket.js";

const FEEDBACK_REMINDER_DELAY_MS = 3 * 60 * 60 * 1000; // 3 hours after event start

const buildTitleAndMessage = (type, data = {}) => {
	switch (type) {
		case "REGISTRATION_CONFIRMED":
			return {
				title: "Registration confirmed",
				message: `You're confirmed for "${data.eventTitle ?? "the event"}". See you there!`,
			};
		case "REGISTRATION_MILESTONE":
			return {
				title: "Registration milestone",
				message: `${data.bookedCount ?? 0} people have booked "${data.eventTitle ?? "your event"}".`,
			};
		case "EVENT_REMINDER":
			return {
				title: "Event reminder",
				message: `"${data.eventTitle ?? "Your event"}" starts in 24 hours.`,
			};
		case "FEEDBACK_REMINDER":
			return {
				title: "Share your feedback",
				message: `How was "${data.eventTitle ?? "the event"}"? Leave a review to help others.`,
			};
		case "EVENT_APPROVED":
			return {
				title: "Event approved",
				message: `Your event "${data.eventTitle ?? ""}" has been approved and is now live.`,
			};
		case "EVENT_REJECTED":
			return {
				title: "Event rejected",
				message: `Your event "${data.eventTitle ?? ""}" was rejected.${data.rejectionReason ? ` Reason: ${data.rejectionReason}` : ""}`,
			};
		case "EVENT_SUBMITTED":
			return {
				title: "Events awaiting approval",
				message: "You have pending events awaiting approval.",
			};
		default:
			return { title: "Notification", message: "" };
	}
};

export async function createNotification({ userId, type, data = {} }) {
	const { title, message } = buildTitleAndMessage(type, data);
	const notification = await NotificationModel.create({
		userId: new mongoose.Types.ObjectId(userId),
		type,
		title,
		message,
		data,
	});

	const unreadCount = await NotificationModel.countDocuments({
		userId: new mongoose.Types.ObjectId(userId),
		read: false,
	});

	emitToUser(userId, "notification:new", {
		notification: fromDoc(notification.toObject()),
		unreadCount,
	});

	return notification;
}

// Admin EVENT_SUBMITTED nudge: if an unread notification already exists for the
// admin, leave it alone (don't stack). Only create when no unread one is present.
export async function notifyAdminsEventSubmitted() {
	const admins = await UserModel.find({ role: "ADMIN" }).select("_id").lean();
	const results = [];
	for (const admin of admins) {
		const existing = await NotificationModel.findOne({
			userId: admin._id,
			type: "EVENT_SUBMITTED",
			read: false,
		});
		if (existing) continue;
		const created = await createNotification({
			userId: admin._id,
			type: "EVENT_SUBMITTED",
			data: {},
		});
		results.push(created);
	}
	return results;
}

// Find events whose start time was >= 3h ago, that haven't been processed yet,
// and send a FEEDBACK_REMINDER to every confirmed attendee. Idempotent: marks
// feedbackReminderSentAt so the next sweep skips them.
export async function sendDueFeedbackReminders() {
	const cutoff = new Date(Date.now() - FEEDBACK_REMINDER_DELAY_MS);
	const dueEvents = await EventModel.find({
		status: "APPROVED",
		isCancelled: false,
		feedbackReminderSentAt: null,
		date: { $lte: cutoff },
	}).select("_id title");

	for (const event of dueEvents) {
		try {
			const registrations = await RegistrationModel.find({
				eventId: event._id,
				status: "CONFIRMED",
			}).select("userId");

			for (const reg of registrations) {
				await createNotification({
					userId: reg.userId,
					type: "FEEDBACK_REMINDER",
					data: { eventTitle: event.title, eventId: event._id.toString() },
				});
			}

			await EventModel.updateOne(
				{ _id: event._id, feedbackReminderSentAt: null },
				{ $set: { feedbackReminderSentAt: new Date() } },
			);
		} catch (err) {
			console.error(`[sendDueFeedbackReminders] event ${event._id} failed:`, err);
		}
	}

	return { processedEvents: dueEvents.length };
}

export async function listForUser(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
	const currentPage = Math.max(1, Number(page) || 1);
	const pageSize = Math.max(1, Number(limit) || 20);
	const skip = (currentPage - 1) * pageSize;

	const filter = { userId: new mongoose.Types.ObjectId(userId) };
	if (unreadOnly) filter.read = false;

	const [items, total, unreadCount] = await Promise.all([
		NotificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
		NotificationModel.countDocuments(filter),
		NotificationModel.countDocuments({ userId: new mongoose.Types.ObjectId(userId), read: false }),
	]);

	return {
		notifications: items,
		pagination: {
			total,
			page: currentPage,
			limit: pageSize,
			totalPages: Math.max(1, Math.ceil(total / pageSize)),
		},
		unreadCount,
	};
}

export async function getUnreadCount(userId) {
	return NotificationModel.countDocuments({
		userId: new mongoose.Types.ObjectId(userId),
		read: false,
	});
}

export async function markAsRead(notificationId, userId) {
	const notification = await NotificationModel.findOne({
		_id: new mongoose.Types.ObjectId(notificationId),
		userId: new mongoose.Types.ObjectId(userId),
	});
	if (!notification) {
		const err = new Error("Notification not found");
		err.code = "NOT_FOUND";
		throw err;
	}
	if (!notification.read) {
		notification.read = true;
		notification.readAt = new Date();
		await notification.save();
	}
	return notification;
}

export async function markAllAsRead(userId) {
	const result = await NotificationModel.updateMany(
		{ userId: new mongoose.Types.ObjectId(userId), read: false },
		{ $set: { read: true, readAt: new Date() } },
	);
	return { modified: result.modifiedCount };
}

export async function deleteNotification(notificationId, userId) {
	const result = await NotificationModel.deleteOne({
		_id: new mongoose.Types.ObjectId(notificationId),
		userId: new mongoose.Types.ObjectId(userId),
	});
	if (result.deletedCount === 0) {
		const err = new Error("Notification not found");
		err.code = "NOT_FOUND";
		throw err;
	}
	return { deleted: true };
}
