import { apiFetch } from "../lib/api";

export type TermsDoc = { version: string; content: string; updatedAt?: string };

export const fetchTerms = (): Promise<TermsDoc> => apiFetch("/terms", { method: "GET" });

export const updateTerms = (payload: { version: string; content: string }): Promise<TermsDoc> =>
	apiFetch("/admin/terms", { method: "PUT", body: JSON.stringify(payload) });
