import { apiFetch } from "../lib/api";

export interface CheckInResult {
	alreadyPresent: boolean;
	registration: {
		_id: string;
		attendanceStatus: "PENDING" | "PRESENT";
		checkedInAt: string | null;
		userId: {
			name: string;
			email: string;
			avatar: string;
		};
		formData?: Record<string, unknown>;
	};
}

export interface EventRegistration {
	_id: string;
	attendanceStatus: "PENDING" | "PRESENT";
	checkedInAt: string | null;
	registeredAt: string;
	userId: {
		_id: string;
		name: string;
		email: string;
		avatar?: string;
	};
}

export async function fetchTicketToken(registrationId: string): Promise<{ token: string }> {
	const res = await apiFetch(`/registrations/${registrationId}/ticket-token`, { method: "GET" });
	return res.data;
}

export async function getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
	const res = await apiFetch(`/events/${eventId}/registrations`, { method: "GET" });
	return res.data;
}

export async function checkInAttendee(eventId: string, token: string, confirm: boolean): Promise<CheckInResult> {
	const res = await apiFetch(`/events/${eventId}/check-in`, {
		method: "POST",
		body: JSON.stringify({ token, confirm }),
	});
	return res.data;
}
