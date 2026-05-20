import * as FeedbackService from "../services/feedback.service.js";
import { fromDoc } from "../models/util.js";

const errorStatus = (code) => {
	switch (code) {
		case "NOT_FOUND":
			return 404;
		case "FORBIDDEN":
			return 403;
		case "FEEDBACK_NOT_OPEN":
		case "EVENT_NOT_FINISHED":
		case "EVENT_CANCELLED":
		case "NOT_ATTENDEE":
		case "DID_NOT_ATTEND":
		case "INVALID_RATING":
			return 400;
		case "ALREADY_SUBMITTED":
			return 409;
		default:
			return 500;
	}
};

export async function triggerHostFeedback(req, res) {
	try {
		const { id } = req.params;
		const result = await FeedbackService.triggerHostFeedback(
			id,
			req.user.userId,
			req.user.role === "ADMIN",
		);
		res.status(200).json({
			success: true,
			alreadySent: result.alreadySent,
			hostFeedbackSentAt: result.event.hostFeedbackSentAt,
		});
	} catch (err) {
		const status = errorStatus(err.code);
		if (status === 500) console.error("[triggerHostFeedback] Error:", err);
		res.status(status).json({ success: false, code: err.code, message: err.message });
	}
}

export async function submitFeedback(req, res) {
	try {
		const { id } = req.params;
		const feedback = await FeedbackService.submitFeedback(id, req.user.userId, req.body);
		res.status(201).json({ success: true, data: fromDoc(feedback.toObject()) });
	} catch (err) {
		const status = errorStatus(err.code);
		if (status === 500) console.error("[submitFeedback] Error:", err);
		res.status(status).json({ success: false, code: err.code, message: err.message });
	}
}

export async function getFeedbackSummary(req, res) {
	try {
		const { id } = req.params;
		const summary = await FeedbackService.getEventFeedbackSummary(id);
		res.status(200).json({ success: true, data: summary });
	} catch (err) {
		const status = errorStatus(err.code);
		if (status === 500) console.error("[getFeedbackSummary] Error:", err);
		res.status(status).json({ success: false, code: err.code, message: err.message });
	}
}

export async function getMyFeedback(req, res) {
	try {
		const { id } = req.params;
		const feedback = await FeedbackService.getMyFeedback(id, req.user.userId);
		res.status(200).json({ success: true, data: feedback });
	} catch (err) {
		console.error("[getMyFeedback] Error:", err);
		res.status(500).json({ success: false, message: "Error fetching feedback" });
	}
}
