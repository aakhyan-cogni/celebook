import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export function useEventStats(eventId: string, enabled: boolean) {
	const [eventStat, setEventStat] = useState<any>(null);

	const refetch = useCallback(() => {
		if (!enabled || !eventId) return;
		apiFetch(`/events/${eventId}/stats` as any)
			.then((data) => setEventStat(data))
			.catch(() => {});
	}, [enabled, eventId]);

	useEffect(() => {
		refetch();
	}, [refetch]);

	useEffect(() => {
		if (!enabled) return;
		const onVisible = () => {
			if (document.visibilityState === "visible") refetch();
		};
		document.addEventListener("visibilitychange", onVisible);
		return () => document.removeEventListener("visibilitychange", onVisible);
	}, [enabled, refetch]);

	return [eventStat, setEventStat, refetch] as const;
}
