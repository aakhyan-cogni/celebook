import mongoose from "mongoose";

const termsConfigSchema = new mongoose.Schema(
	{
		currentVersion: { type: String, required: true },
	},
	{ timestamps: true },
);

export const TermsConfigModel = mongoose.model("TermsConfig", termsConfigSchema);

export const TERMS_CONFIG_COLLECTION = "TermsConfig";
