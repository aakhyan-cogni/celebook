import * as ConsentService from "../services/consent.service.js";

export async function getPublicTerms(req, res) {
	try {
		const terms = await ConsentService.getCurrentTerms();
		res.status(200).json(terms);
	} catch (error) {
		console.error("[getPublicTerms] Error in Terms controller:", error);
		res.status(500).json({ message: "Error fetching terms" });
	}
}
