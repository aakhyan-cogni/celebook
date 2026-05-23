

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

const bucketOf = (e: EventLike | null | undefined, now: number) => {
	const s = computeEventTimeState(e, now);
	return s === "ONGOING" ? 0 : s === "UPCOMING" ? 1 : 2;
};

const dateMs = (e: EventLike | null | undefined) => (e?.date ? new Date(e.date).getTime() : 0);

export function sortEventsByTimeState<T extends EventLike>(events: T[], now = Date.now()): T[] {
	return [...events].sort((a, b) => {
		const ba = bucketOf(a, now);
		const bb = bucketOf(b, now);
		if (ba !== bb) return ba - bb;
		const da = dateMs(a);
		const db = dateMs(b);
		return ba === 2 ? db - da : da - db;
	});
}

export function sortByEventTimeState<T>(
	items: T[],
	accessor: (item: T) => EventLike | null | undefined,
	now = Date.now(),
): T[] {
	return [...items].sort((a, b) => {
		const ea = accessor(a);
		const eb = accessor(b);
		const ba = bucketOf(ea, now);
		const bb = bucketOf(eb, now);
		if (ba !== bb) return ba - bb;
		const da = dateMs(ea);
		const db = dateMs(eb);
		return ba === 2 ? db - da : da - db;
	});
}
