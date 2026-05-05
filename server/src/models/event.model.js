import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
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
	},
	{ timestamps: true },
);

export const EventModel = mongoose.model("Event", eventSchema);

export const EVENT_COLLECTION = "Event";
