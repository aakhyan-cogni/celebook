import mongoose from "mongoose";
import {
	FeedbackModel,
	EventModel,
	RegistrationModel,
	EventStatModel,
	FEEDBACK_RATING_FIELDS,
} from "../models/index.js";
import { createNotification } from "./notification.service.js";

export async function triggerHostFeedback(eventId, requestingUserId, isAdmin = false) {
	const event = await EventModel.findById(eventId);
	if (!event) {
		const err = new Error("Event not found");
		err.code = "NOT_FOUND";
		throw err;
	}

	const isOrganizer = event.organizerId.toString() === requestingUserId.toString();
	if (!isOrganizer && !isAdmin) {
		const err = new Error("Forbidden");
		err.code = "FORBIDDEN";
		throw err;
	}

	if (event.isCancelled) {
		const err = new Error("Event is cancelled");
		err.code = "EVENT_CANCELLED";
		throw err;
	}

	if (new Date(event.date).getTime() >= Date.now()) {
		const err = new Error("Event has not finished yet");
		err.code = "EVENT_NOT_FINISHED";
		throw err;
	}

	if (event.hostFeedbackSentAt) {
		return { event, alreadySent: true };
	}

	const now = new Date();
	event.hostFeedbackSentAt = now;
	await event.save();
// notify feedback only to present attendees, CHANGED
	const stat = await EventStatModel.findOne({
		eventId: new mongoose.Types.ObjectId(eventId),
	}).select("presentAttendees");

	const presentAttendees = stat?.presentAttendees ?? [];

	for (const userId of presentAttendees) {
		try {
			await createNotification({
				userId,
				type: "FEEDBACK_REMINDER",
				data: { eventTitle: event.title, eventId: event._id.toString() },
			});
		} catch (err) {
			console.error(`[triggerHostFeedback] notify failed for user ${userId}:`, err);
		}
	}

	return { event, alreadySent: false };
}

export async function submitFeedback(eventId, userId, payload) {
	const event = await EventModel.findById(eventId);
	if (!event) {
		const err = new Error("Event not found");
		err.code = "NOT_FOUND";
		throw err;
	}

	if (new Date(event.date).getTime() >= Date.now()) {
		const err = new Error("Event has not finished yet");
		err.code = "EVENT_NOT_FINISHED";
		throw err;
	}

	if (!event.hostFeedbackSentAt) {
		const err = new Error("Host has not requested feedback yet");
		err.code = "FEEDBACK_NOT_OPEN";
		throw err;
	}

	const registration = await RegistrationModel.findOne({
		eventId: new mongoose.Types.ObjectId(eventId),
		userId: new mongoose.Types.ObjectId(userId),
		status: "CONFIRMED",
	});
	if (!registration) {
		const err = new Error("You must be a confirmed attendee to leave feedback");
		err.code = "NOT_ATTENDEE";
		throw err;
	}
	if (registration.attendanceStatus !== "PRESENT") {
		const err = new Error("Only attendees who were checked in can leave feedback");
		err.code = "DID_NOT_ATTEND";
		throw err;
	}

	const existing = await FeedbackModel.findOne({
		eventId: new mongoose.Types.ObjectId(eventId),
		userId: new mongoose.Types.ObjectId(userId),
	});
	if (existing) {
		const err = new Error("Feedback already submitted");
		err.code = "ALREADY_SUBMITTED";
		throw err;
	}

	const doc = {
		eventId: new mongoose.Types.ObjectId(eventId),
		userId: new mongoose.Types.ObjectId(userId),
		wouldAttendAgain: !!payload.wouldAttendAgain,
		areasOfImprovement: (payload.areasOfImprovement ?? "").toString().trim(),
	};
	for (const field of FEEDBACK_RATING_FIELDS) {
		const value = Number(payload[field]);
		if (!Number.isFinite(value) || value < 0.5 || value > 5) {
			const err = new Error(`Invalid rating for ${field}`);
			err.code = "INVALID_RATING";
			throw err;
		}
		doc[field] = value;
	}

	try {
		return await FeedbackModel.create(doc);
	} catch (err) {
		if (err?.code === 11000) {
			const duplicate = new Error("Feedback already submitted");
			duplicate.code = "ALREADY_SUBMITTED";
			throw duplicate;
		}
		throw err;
	}
}

export async function getEventFeedbackSummary(eventId) {
	const event = await EventModel.findById(eventId).select("hostFeedbackSentAt").lean();
	if (!event) {
		const err = new Error("Event not found");
		err.code = "NOT_FOUND";
		throw err;
	}

	const docs = await FeedbackModel.find({
		eventId: new mongoose.Types.ObjectId(eventId),
	})
		.sort({ createdAt: -1 })
		.lean();

	const count = docs.length;
	const averages = { feedbackCount: count };
	for (const field of FEEDBACK_RATING_FIELDS) {
		const sum = docs.reduce((acc, d) => acc + (d[field] || 0), 0);
		averages[field] = count > 0 ? Number((sum / count).toFixed(2)) : 0;
	}

	const comments = docs
		.filter((d) => d.areasOfImprovement && d.areasOfImprovement.trim() !== "")
		.map((d) => ({
			id: d._id.toString(),
			text: d.areasOfImprovement,
			createdAt: d.createdAt,
		}));

	return {
		hostFeedbackSentAt: event.hostFeedbackSentAt ?? null,
		averages,
		comments,
	};
}

export async function getMyFeedback(eventId, userId) {
	const feedback = await FeedbackModel.findOne({
		eventId: new mongoose.Types.ObjectId(eventId),
		userId: new mongoose.Types.ObjectId(userId),
	}).lean();
	return feedback ?? null;
}
