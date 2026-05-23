

export type EventTimeState = "UPCOMING" | "ONGOING" | "FINISHED";

export interface EventLike {
	date?: string | Date | null;
	endDate?: string | Date | null;
	endedAt?: string | Date | null;
}

export function computeEventTimeState(event: EventLike | null | undefined, now = Date.now()): EventTimeState {
	if (!event) return "UPCOMING";
	if (event.endedAt) return "FINISHED";

	const start = event.date ? new Date(event.date).getTime() : null;
	if (start === null) return "UPCOMING";
	if (now < start) return "UPCOMING";

	const end = event.endDate ? new Date(event.endDate).getTime() : start;
	if (now < end) return "ONGOING";
	return "FINISHED";
}

export const isUpcoming = (e: EventLike | null | undefined, now?: number) =>
	computeEventTimeState(e, now) === "UPCOMING";
export const isOngoing = (e: EventLike | null | undefined, now?: number) =>
	computeEventTimeState(e, now) === "ONGOING";
export const isFinished = (e: EventLike | null | undefined, now?: number) =>
	computeEventTimeState(e, now) === "FINISHED";
