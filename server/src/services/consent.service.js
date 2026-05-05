import { TermsConfigModel } from "../models/terms-config.model.js";
import { UserModel } from "../models/user.model.js";
import { DEFAULT_TERMS_VERSION } from "../config/constants.js";

export async function getOrCreateTermsConfig() {
	const existing = await TermsConfigModel.findOne({}).lean();
	if (existing) {
		return {
			id: existing._id.toString(),
			currentVersion: existing.currentVersion,
			updatedAt: existing.updatedAt,
		};
	}

	const created = await TermsConfigModel.create({ currentVersion: DEFAULT_TERMS_VERSION });
	return {
		id: created._id.toString(),
		currentVersion: created.currentVersion,
		updatedAt: created.updatedAt,
	};
}

export async function getCurrentTermsVersion() {
	const config = await getOrCreateTermsConfig();
	return config.currentVersion;
}

export async function acceptConsent(userId) {
	const currentVersion = await getCurrentTermsVersion();
	const now = new Date();
	const doc = await UserModel.findByIdAndUpdate(
		userId,
		{
			$set: {
				consentAccepted: true,
				consentAcceptedAt: now,
				consentVersion: currentVersion,
			},
		},
		{ new: true, select: "consentAccepted consentAcceptedAt consentVersion" },
	).lean();

	if (!doc) return null;
	return {
		id: doc._id.toString(),
		consentAccepted: doc.consentAccepted,
		consentAcceptedAt: doc.consentAcceptedAt ?? null,
		consentVersion: doc.consentVersion ?? null,
	};
}

export async function getConsentStatus(userId) {
	const [user, currentVersion] = await Promise.all([
		UserModel.findById(userId).select("consentAccepted consentVersion").lean(),
		getCurrentTermsVersion(),
	]);

	const accepted = Boolean(user?.consentAccepted);
	const userVersion = user?.consentVersion ?? null;
	const needsRenewal = !accepted || userVersion !== currentVersion;

	return { accepted, userVersion, currentVersion, needsRenewal };
}
