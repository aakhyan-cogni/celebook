import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		name: { type: String, required: true },
		avatar: { type: String, default: "default.png" },
		phoneNumber: { type: String, default: null },
		dob: { type: String, default: null },
		gender: { type: String, default: null },
		country: { type: String, default: null },
		city: { type: String, default: null },
		state: { type: String, default: null },
		zipcode: { type: String, default: null },
		orgName: { type: String, default: null },
		designation: { type: String, default: null },
		companyWebsite: { type: String, default: null },
		bio: { type: String, default: null },
		refreshToken: { type: String, default: null },
		role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
		tier: { type: String, enum: ["FREE", "PRO", "ULTIMATE"], default: "FREE" },
		consentAccepted: { type: Boolean, default: false },
		consentAcceptedAt: { type: Date, default: null },
		consentVersion: { type: String, default: null },
	},
	{ timestamps: true },
);

export const UserModel = mongoose.model("User", userSchema);

export const USER_COLLECTION = "User";
