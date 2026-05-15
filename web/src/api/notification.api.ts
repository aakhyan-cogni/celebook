import { apiFetch } from "../lib/api";

export interface NotificationDTO {
	id: string;
	userId: string;
	type: string;
	title: string;
	message: string;
	data?: Record<string, unknown>;
	read: boolean;
	readAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface NotificationListResponse {
	success: boolean;
	data: {
		notifications: NotificationDTO[];
		pagination: { total: number; page: number; limit: number; totalPages: number };
		unreadCount: number;
	};
}

export function listNotifications(params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) {
	const query: Record<string, string> = {};
	if (params.page) query.page = String(params.page);
	if (params.limit) query.limit = String(params.limit);
	if (params.unreadOnly) query.unreadOnly = "true";
	return apiFetch("/notifications", { method: "GET" }, query) as Promise<NotificationListResponse>;
}

export function getUnreadCount() {
	return apiFetch("/notifications/unread-count", { method: "GET" }) as Promise<{
		success: boolean;
		data: { unreadCount: number };
	}>;
}

export function markNotificationAsRead(id: string) {
	return apiFetch(`/notifications/${id}/read`, { method: "PATCH" }) as Promise<{
		success: boolean;
		data: NotificationDTO;
	}>;
}

export function markAllNotificationsAsRead() {
	return apiFetch("/notifications/read-all", { method: "PATCH" }) as Promise<{
		success: boolean;
		data: { modified: number };
	}>;
}

export function deleteNotification(id: string) {
	return apiFetch(`/notifications/${id}`, { method: "DELETE" }) as Promise<{
		success: boolean;
		data: { deleted: true };
	}>;
}
