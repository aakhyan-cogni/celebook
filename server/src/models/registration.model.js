import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
	{
		eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED"], default: "PENDING" },
		registeredAt: { type: Date, default: Date.now },
	},
	{ timestamps: true },
);

registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const RegistrationModel = mongoose.model("Registration", registrationSchema);
export const REGISTRATION_COLLECTION = "Registration";