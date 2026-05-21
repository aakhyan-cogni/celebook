import mongoose from "mongoose";

const eventStatSchema = new mongoose.Schema(
	{
		eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, unique: true },
		registeredAttendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		presentAttendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	},
	{ timestamps: true },
);

export const EventStatModel = mongoose.model("EventStat", eventStatSchema);
export const EVENT_STAT_COLLECTION = "EventStat";

// removed avgFeedback as it is calculated on demand in single event page 
