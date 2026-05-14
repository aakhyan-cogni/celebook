import mongoose from "mongoose";
import { NOTIFICATION_TYPES } from "../config/constants.js";

const notificationSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		type: { type: String, enum: NOTIFICATION_TYPES, required: true },
		title: { type: String, required: true },
		message: { type: String, required: true },
		data: { type: mongoose.Schema.Types.Mixed, default: {} },
		read: { type: Boolean, default: false },
		readAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, type: 1, read: 1 });

export const NotificationModel = mongoose.model("Notification", notificationSchema);
export const NOTIFICATION_COLLECTION = "Notification";
