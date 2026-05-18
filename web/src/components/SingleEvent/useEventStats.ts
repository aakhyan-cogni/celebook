import { useEffect, useState } from "react";
import { BASE_URL } from "../../lib/api";

export function useEventStats(
	eventId: string,
	accessToken: string | null | undefined,
	enabled: boolean,
) {
	const [eventStat, setEventStat] = useState<any>(null);

	useEffect(() => {
		if (!enabled || !accessToken) return;
		fetch(`${BASE_URL}/events/${eventId}/stats`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			credentials: "include",
		})
			.then((r) => (r.ok ? r.json() : null))
			.then((data) => setEventStat(data))
			.catch(() => {});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [enabled, accessToken]);

	return [eventStat, setEventStat] as const;
}
