import { apiFetch } from "../lib/api";

export function acceptConsent(): Promise<{ message: string }> {
	return apiFetch("/consent/accept", { method: "POST" });
}
