import { AppFeedbackModel } from "../models/appFeedback.model.js";

export const createFeedback = async (req, res) => {
	try {
		const { rating, message } = req.body;

		if (!rating || !message) {
			return res.status(400).json({
				success: false,
				message: "Both rating and message fields are required.",
			});
		}

		if (rating < 1 || rating > 5) {
			return res.status(400).json({
				success: false,
				message: "Rating must be a whole number between 1 and 5.",
			});
		}

		// console.log(req.user); - for debugn purpose
		const userId = req.user?.userId || null;

		const newFeedback = new AppFeedbackModel({
			userId,
			rating,
			message,
		});

		await newFeedback.save();

		return res.status(201).json({
			success: true,
			message: "Feedback submitted successfully! Thank you.",
			data: newFeedback,
		});
	} catch (error) {
		console.error("Error saving feedback:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error. Failed to submit feedback.",
		});
	}
};
