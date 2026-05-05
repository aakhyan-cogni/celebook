import mongoose from "mongoose";

export const EVENT_STATUSES = ["PENDING", "APPROVED", "REJECTED"];
export const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR"];

const eventSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		currency: { type: String, enum: CURRENCIES, required: true },
		category: { type: String, required: true },
		description: { type: String, default: "" },
		tags: { type: [String], default: [] },
		imgUrls: { type: [String], default: [] },
		date: { type: Date, required: true },
		location: { type: String, required: true },
		price: { type: Number, default: 0 },
		capacity: { type: Number, required: true },
		organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		organizerEmail: { type: String, required: true },
		status: { type: String, enum: EVENT_STATUSES, default: "PENDING" },
		rejectionReason: { type: String, default: null },
	},
	{ timestamps: true },
);

export const EventModel = mongoose.model("Event", eventSchema);

export const EVENT_COLLECTION = "Event";
