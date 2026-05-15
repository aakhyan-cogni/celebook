import { create } from "zustand";
import type { NotificationDTO } from "../api/notification.api";
import {
	listNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
	deleteNotification as deleteNotificationApi,
} from "../api/notification.api";

interface NotificationState {
	notifications: NotificationDTO[];
	unreadCount: number;
	loading: boolean;
	error: string | null;
	hasLoaded: boolean;

	fetchNotifications: () => Promise<void>;
	prependNotification: (n: NotificationDTO, unreadCount?: number) => void;
	setUnreadCount: (count: number) => void;
	markAsRead: (id: string) => Promise<void>;
	markAllAsRead: () => Promise<void>;
	removeNotification: (id: string) => Promise<void>;
	reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
	notifications: [],
	unreadCount: 0,
	loading: false,
	error: null,
	hasLoaded: false,

	fetchNotifications: async () => {
		set({ loading: true, error: null });
		try {
			const res = await listNotifications({ page: 1, limit: 50 });
			set({
				notifications: res.data.notifications,
				unreadCount: res.data.unreadCount,
				loading: false,
				hasLoaded: true,
			});
		} catch (err) {
			set({
				loading: false,
				error: err instanceof Error ? err.message : "Failed to load notifications",
			});
		}
	},

	prependNotification: (n, unreadCount) => {
		const existing = get().notifications;
		if (existing.some((it) => it.id === n.id)) return;
		set({
			notifications: [n, ...existing],
			unreadCount: typeof unreadCount === "number" ? unreadCount : get().unreadCount + 1,
		});
	},

	setUnreadCount: (count) => set({ unreadCount: count }),

	markAsRead: async (id) => {
		const prev = get().notifications;
		const target = prev.find((n) => n.id === id);
		if (!target || target.read) return;
		set({
			notifications: prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)),
			unreadCount: Math.max(0, get().unreadCount - 1),
		});
		try {
			await markNotificationAsRead(id);
		} catch (err) {
			set({ notifications: prev, error: err instanceof Error ? err.message : "Failed to mark as read" });
		}
	},

	markAllAsRead: async () => {
		const prev = get().notifications;
		set({
			notifications: prev.map((n) => (n.read ? n : { ...n, read: true, readAt: new Date().toISOString() })),
			unreadCount: 0,
		});
		try {
			await markAllNotificationsAsRead();
		} catch (err) {
			set({ notifications: prev, error: err instanceof Error ? err.message : "Failed to mark all as read" });
		}
	},

	removeNotification: async (id) => {
		const prev = get().notifications;
		const target = prev.find((n) => n.id === id);
		set({
			notifications: prev.filter((n) => n.id !== id),
			unreadCount: target && !target.read ? Math.max(0, get().unreadCount - 1) : get().unreadCount,
		});
		try {
			await deleteNotificationApi(id);
		} catch (err) {
			set({ notifications: prev, error: err instanceof Error ? err.message : "Failed to delete" });
		}
	},

	reset: () => set({ notifications: [], unreadCount: 0, loading: false, error: null, hasLoaded: false }),
}));
