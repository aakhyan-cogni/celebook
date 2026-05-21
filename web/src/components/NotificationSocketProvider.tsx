import { useEffect } from "react";
import toast from "react-hot-toast";
import { Bell } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { connectSocket, disconnectSocket } from "../lib/socket";
import { apiFetch } from "../lib/api";
import type { NotificationDTO } from "../api/notification.api";

interface NewNotificationEvent {
	notification: NotificationDTO;
	unreadCount: number;
}

export default function NotificationSocketProvider() {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const accessToken = useAuthStore((s) => s.accessToken);
	const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
	const prependNotification = useNotificationStore((s) => s.prependNotification);
	const reset = useNotificationStore((s) => s.reset);
	const setConsentRequired = useAuthStore((s) => s.setConsentRequired);
	const updateUser = useAuthStore((s) => s.updateUser);

	useEffect(() => {
		if (!isAuthenticated || !accessToken) {
			disconnectSocket();
			reset();
			return;
		}

		fetchNotifications();
		const socket = connectSocket(accessToken);

		const handleNewNotification = (payload: NewNotificationEvent) => {
			prependNotification(payload.notification, payload.unreadCount);
			toast(
				(t) => (
					<span
						style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
						onClick={() => toast.dismiss(t.id)}
					>
						<Bell size={18} />
						<span>
							<strong>New notification</strong>
							<br />
							<small>{payload.notification.title}</small>
						</span>
					</span>
				),
				{ duration: 4000 },
			);
		};

		const handleTermsUpdated = async (payload: { version: string }) => {
			toast(
				(t) => (
					<span
						style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
						onClick={() => toast.dismiss(t.id)}
					>
						<Bell size={18} />
						<span>
							<strong>Terms &amp; Conditions updated</strong>
							<br />
							<small>Please review and accept version {payload.version}.</small>
						</span>
					</span>
				),
				{ duration: 6000 },
			);
			try {
				const me = await apiFetch("/auth/me", { method: "GET" });
				if (me?.user) updateUser({ ...me.user });
				setConsentRequired(me?.consent?.needsRenewal === true);
			} catch {
				// Fall back to the next API-call 403 trigger.
				setConsentRequired(true);
			}
		};

		socket.on("notification:new", handleNewNotification);
		socket.on("terms:updated", handleTermsUpdated);
		socket.on("connect_error", (err) => {
			console.error("[socket] connect_error:", err.message);
		});

		return () => {
			socket.off("notification:new", handleNewNotification);
			socket.off("terms:updated", handleTermsUpdated);
		};
	}, [isAuthenticated, accessToken, fetchNotifications, prependNotification, reset, setConsentRequired, updateUser]);

	return null;
}
