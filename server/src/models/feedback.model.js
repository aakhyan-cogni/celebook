import mongoose from "mongoose";

const RATING_FIELDS = [
	"overallRating",
	"worthAttending",
	"contentRelevance",
	"venueQuality",
	"punctuality",
	"facilitatorBehaviour",
];

const ratingType = {
	type: Number,
	required: true,
	min: 0.5,
	max: 5,
	validate: {
		validator: (v) => Math.round(v * 2) === v * 2,
		message: "Rating must be in 0.5 steps",
	},
};

const feedbackSchema = new mongoose.Schema(
	{
		eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		overallRating: ratingType,
		worthAttending: ratingType,
		contentRelevance: ratingType,
		venueQuality: ratingType,
		punctuality: ratingType,
		facilitatorBehaviour: ratingType,
		wouldAttendAgain: { type: Boolean, required: true },
		areasOfImprovement: { type: String, default: "" },
	},
	{ timestamps: true },
);

feedbackSchema.index({ eventId: 1, userId: 1 }, { unique: true });
feedbackSchema.index({ eventId: 1, createdAt: -1 });

export const FeedbackModel = mongoose.model("Feedback", feedbackSchema);
export const FEEDBACK_COLLECTION = "Feedback";
export const FEEDBACK_RATING_FIELDS = RATING_FIELDS;
