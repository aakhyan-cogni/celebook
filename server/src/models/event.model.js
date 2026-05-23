import mongoose from "mongoose";

export const EVENT_STATUSES = ["DRAFT", "PENDING", "APPROVED", "REJECTED"];
export const EVENT_VISIBILITIES = ["PUBLIC", "UNLISTED"];
export const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR"];

const eventSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		currency: { type: String, enum: CURRENCIES, required: true },
		category: { type: String, required: true },
		description: { type: String, default: "" },
		tags: { type: [String], default: [] },
		date: { type: Date, required: true },
		endDate: { type: Date, default: null },
		location: { type: String, required: true },
		price: { type: Number, default: 0, min: 0 },
		capacity: { type: Number, required: true, min: 1 },
		imgUrls: { type: [String], default: [] },
		organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		organizerEmail: { type: String, required: true },
		status: { type: String, enum: EVENT_STATUSES, default: "DRAFT" },
		rejectionReason: { type: String, default: null },
		visibility: { type: String, enum: EVENT_VISIBILITIES, default: "PUBLIC" },
		formSchemaId: { type: mongoose.Schema.Types.ObjectId, ref: "FormSchema", default: null },
		isCancelled: { type: Boolean, default: false },
		cancelReason: { type: String, default: null },
		feedbackReminderSentAt: { type: Date, default: null },
		hostFeedbackSentAt: { type: Date, default: null },

		endedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

eventSchema.pre("validate", function (next) {
	if (this.endDate && this.date && this.endDate.getTime() <= this.date.getTime()) {
		this.invalidate("endDate", "endDate must be after start date");
	}
	next();
});

eventSchema.index({ organizerId: 1 });
eventSchema.index({ status: 1, visibility: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ title: "text", description: "text" });

export const EventModel = mongoose.model("Event", eventSchema);

export const EVENT_COLLECTION = "Event";
