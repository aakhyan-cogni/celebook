

export function computeEventTimeState(event, now = Date.now()) {
	if (!event) return "UPCOMING";
	if (event.endedAt) return "FINISHED";

	const start = event.date ? new Date(event.date).getTime() : null;
	if (start === null) return "UPCOMING";
	if (now < start) return "UPCOMING";

	const end = event.endDate ? new Date(event.endDate).getTime() : start;
	if (now < end) return "ONGOING";
	return "FINISHED";
}

export const isUpcoming = (event, now) => computeEventTimeState(event, now) === "UPCOMING";
export const isOngoing = (event, now) => computeEventTimeState(event, now) === "ONGOING";
export const isFinished = (event, now) => computeEventTimeState(event, now) === "FINISHED";
