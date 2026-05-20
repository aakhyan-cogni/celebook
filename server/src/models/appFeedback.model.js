import mongoose from "mongoose";
import { USER_COLLECTION } from "./user.model.js";

const appFeedbackSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: USER_COLLECTION,
			default: null,
		},
		rating: { 
			type: Number, 
			required: true, 
			min: 1, 
			max: 5 
		},
		message: { 
			type: String, 
			required: true,
			trim: true 
		},
	},
	{ 
		timestamps: true 
	},
);

export const AppFeedbackModel = mongoose.model("AppFeedback", appFeedbackSchema);
export const APP_FEEDBACK_COLLECTION = "AppFeedback";