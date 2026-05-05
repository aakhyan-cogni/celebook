import * as ConsentService from "../services/consent.service.js";

export async function acceptConsent(req, res) {
	try {
		if (!req.user) throw new Error("User not authenticated");

		await ConsentService.acceptConsent(req.user.userId);
		res.status(200).json({ ok: true });
	} catch (error) {
		console.error("[acceptConsent] Error in Consent controller:", error);
		res.status(500).json({ message: "Error accepting consent" });
	}
}

export async function getConsentStatus(req, res) {
	try {
		if (!req.user) throw new Error("User not authenticated");

		const status = await ConsentService.getConsentStatus(req.user.userId);
		res.status(200).json(status);
	} catch (error) {
		console.error("[getConsentStatus] Error in Consent controller:", error);
		res.status(500).json({ message: "Error fetching consent status" });
	}
}
