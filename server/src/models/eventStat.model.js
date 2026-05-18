import mongoose from "mongoose";

const eventStatSchema = new mongoose.Schema(
	{
		eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, unique: true },
		registeredAttendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		presentAttendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		avgFeedback: { type: Number },
	},
	{ timestamps: true },
);

export const EventStatModel = mongoose.model("EventStat", eventStatSchema);
export const EVENT_STAT_COLLECTION = "EventStat";
