import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../store/useAuthStore";
import { BASE_URL } from "../../../lib/api";

export function useDashboardEvents() {
	const accessToken = useAuthStore((s) => s.accessToken);
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

	const [myEvents, setMyEvents] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const authHeaders = () => ({
		"Content-Type": "application/json",
		Authorization:  `Bearer ${accessToken}`,
	});

	const fetchMyEvents = async () => {
		try {
			setLoading(true);
			const res = await fetch(`${BASE_URL}/events/mine`, {
				method: "GET",
				headers: authHeaders(),
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed to load");
			const data = await res.json();
			setMyEvents(Array.isArray(data) ? data : (data.events ?? []));
		} catch {
			toast.error("Could not load your events.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// Wait for hydration: accessToken is briefly null on page refresh while
		// /auth/refresh runs.
		if (isAuthenticated && !accessToken) {
			setLoading(true);
			return;
		}
		if (!accessToken) return;
		fetchMyEvents();
	}, [accessToken, isAuthenticated]);

	const publish = async (eventId: string) => {
		try {
			const res = await fetch(`${BASE_URL}/events/${eventId}/publish`, {
				method: "POST", headers: authHeaders(), credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) {
				toast.error(
					data.message === "TIER_LIMIT_EXCEEDED"
						? "You've reached your plan's event limit. Upgrade to publish more."
						: data.message || "Could not publish.",
				);
				return;
			}
			if (data.status === "PENDING") {
				toast.success("Submitted for review. You'll be notified when approved.", { duration: 5000 });
			} else if (data.status === "APPROVED") {
				toast.success("Event is live! 🎉");
			}
			fetchMyEvents();
		} catch {
			toast.error("Could not publish event.");
		}
	};

	const remove = async (target: any) => {
		try {
			const res = await fetch(`${BASE_URL}/events/${target.id}`, {
				method: "DELETE", headers: authHeaders(), credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) {
				toast.error(
					data.message === "HAS_REGISTRATIONS"
						? "This event has registered attendees and cannot be deleted."
						: data.message || "Could not delete.",
				);
				return false;
			}
			toast.success("Event deleted.");
			fetchMyEvents();
			return true;
		} catch {
			toast.error("Could not delete event.");
			return false;
		}
	};

	const cancel = async (target: any, reason: string) => {
		try {
			const res = await fetch(`${BASE_URL}/events/${target.id}/cancel`, {
				method: "POST",
				headers: authHeaders(),
				credentials: "include",
				body: JSON.stringify({ reason: reason.trim() || null }),
			});
			if (!res.ok) throw new Error((await res.json()).message);
			toast.success("Event cancelled.");
			fetchMyEvents();
			return true;
		} catch (err: any) {
			toast.error(err?.message || "Could not cancel event.");
			return false;
		}
	};

	const duplicate = async (eventId: string) => {
		try {
			const res = await fetch(`${BASE_URL}/events/${eventId}/duplicate`, {
				method: "POST", headers: authHeaders(), credentials: "include",
			});
			if (!res.ok) throw new Error();
			toast.success("Event duplicated as a new draft.");
			fetchMyEvents();
		} catch {
			toast.error("Could not duplicate event.");
		}
	};

	return { myEvents, loading, publish, remove, cancel, duplicate };
}
