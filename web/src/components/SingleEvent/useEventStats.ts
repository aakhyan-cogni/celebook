import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export function useEventStats(eventId: string, enabled: boolean) {
	const [eventStat, setEventStat] = useState<any>(null);

	useEffect(() => {
		if (!enabled) return;
		apiFetch(`/events/${eventId}/stats` as any)
			.then((data) => setEventStat(data))
			.catch(() => {});
	}, [enabled, eventId]);

	return [eventStat, setEventStat] as const;
}
