import * as ConsentService from "../services/consent.service.js";

export async function consentCheck(req, res, next) {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const status = await ConsentService.getConsentStatus(req.user.userId);
		if (status.needsRenewal) {
			return res.status(403).json({
				code: "CONSENT_REQUIRED",
				message: "Consent required",
				currentVersion: status.currentVersion,
				userVersion: status.userVersion,
			});
		}

		next();
	} catch (error) {
		console.error("[consentCheck] Error in consent middleware:", error);
		res.status(500).json({ message: "Error verifying consent" });
	}
}
