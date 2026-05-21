import { apiFetch } from "../lib/api";

export const FEEDBACK_RATING_FIELDS = [
	"overallRating",
	"worthAttending",
	"contentRelevance",
	"venueQuality",
	"punctuality",
	"facilitatorBehaviour",
] as const;

export type FeedbackRatingField = (typeof FEEDBACK_RATING_FIELDS)[number];

export const FEEDBACK_FIELD_LABELS: Record<FeedbackRatingField, string> = {
	overallRating: "Overall Rating",
	worthAttending: "Worth Attending",
	contentRelevance: "Content Relevance",
	venueQuality: "Venue Quality",
	punctuality: "Punctuality",
	facilitatorBehaviour: "Facilitator Behaviour",
};

export interface FeedbackPayload {
	overallRating: number;
	worthAttending: number;
	contentRelevance: number;
	venueQuality: number;
	punctuality: number;
	facilitatorBehaviour: number;
	wouldAttendAgain: boolean;
	areasOfImprovement?: string;
}

export interface FeedbackComment {
	id: string;
	text: string;
	createdAt: string;
}

export interface FeedbackAverages {
	feedbackCount: number;
	overallRating: number;
	worthAttending: number;
	contentRelevance: number;
	venueQuality: number;
	punctuality: number;
	facilitatorBehaviour: number;
}

export interface FeedbackSummary {
	hostFeedbackSentAt: string | null;
	averages: FeedbackAverages;
	comments: FeedbackComment[];
}

export function triggerHostFeedback(eventId: string) {
	return apiFetch(`/events/${eventId}/feedback/host-trigger`, { method: "POST" }) as Promise<{
		success: boolean;
		alreadySent: boolean;
		hostFeedbackSentAt: string;
	}>;
}

export function submitFeedback(eventId: string, payload: FeedbackPayload) {
	return apiFetch(`/events/${eventId}/feedback`, {
		method: "POST",
		body: JSON.stringify(payload),
	}) as Promise<{ success: boolean; data: unknown }>;
}

export function getFeedbackSummary(eventId: string) {
	return apiFetch(`/events/${eventId}/feedback`, { method: "GET" }) as Promise<{
		success: boolean;
		data: FeedbackSummary;
	}>;
}

export function getMyFeedback(eventId: string) {
	return apiFetch(`/events/${eventId}/feedback/mine`, { method: "GET" }) as Promise<{
		success: boolean;
		data: FeedbackPayload | null;
	}>;
}
