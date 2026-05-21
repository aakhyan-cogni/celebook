import { logout as logoutReq } from "../api/auth.api";
import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = "http://localhost:5000/api";
export { BASE_URL };

const SERVER_ORIGIN = "http://localhost:5000";

export function getImageUrl(path: string | null | undefined): string {
	if (!path) return "";
	if (path.startsWith("http://") || path.startsWith("https://")) return path;
	return `${SERVER_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

export const EVENT_FALLBACK_IMG =
	"https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1000";

type FetchOptions = RequestInit & { body?: any };

let refreshPromise: Promise<{ accessToken: string }> | null = null;

export async function apiFetch(
	endpoint: API_PATH,
	options: FetchOptions = {},
	queryParams: Record<string, string> = {},
) {
	const { accessToken, setAccessToken, logout, setConsentRequired, setPendingRequest } = useAuthStore.getState();
	const headers: HeadersInit = new Headers(options?.headers || {});
	headers.set("Content-Type", "application/json");

	if (accessToken) {
		headers.set("Authorization", `Bearer ${accessToken}`);
	}

	const config: RequestInit = {
		...options,
		headers,
		credentials: "include",
		body: options.body,
	};

	const hasParams = Object.keys(queryParams).length > 0;
	let finalUrl = BASE_URL + endpoint;
	if (hasParams) finalUrl += `?${new URLSearchParams(queryParams).toString()}`;

	let response = await fetch(finalUrl, config);

	if (response.status === 403) {
		const errorData = await response.json().catch(() => ({}));
		if (errorData.code === "CONSENT_REQUIRED" && endpoint !== "/consent/accept") {
			// Don't throw — that would let the caller toast a confusing "Consent required"
			// message even though the modal is opening. Instead, return a Promise that
			// resolves once the user accepts and the queued retry completes. From the
			// caller's perspective, the original action just took a long time.
			setConsentRequired(true);
			return new Promise((resolve, reject) => {
				setPendingRequest(() =>
					apiFetch(endpoint, options, queryParams).then(resolve, reject),
				);
			});
		}
		throw new Error(errorData.message || "Access forbidden");
	}

	if (response.status === 401 && endpoint !== "/auth/login") {
		try {
			if (!refreshPromise) {
				refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
					method: "POST",
					credentials: "include",
				}).then((res) => {
					if (!res.ok) throw new Error("Session expired. Please log in again.");
					return res.json();
				});
			}
			const { accessToken: newToken } = await refreshPromise;
			refreshPromise = null;
			setAccessToken(newToken);

			headers.set("Authorization", `Bearer ${newToken}`);
			response = await fetch(`${BASE_URL}${endpoint}`, { ...config, headers });
		} catch (error) {
			refreshPromise = null;
			logout();
			logoutReq();
			throw new Error(error instanceof Error ? error.message : "Session expired. Please log in again.");
		}
	}

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || "API request failed");
	}

	return response.json();
}

type API_PATH =
	| `/auth/login`
	| `/auth/register`
	| `/auth/refresh`
	| `/auth/logout`
	| `/auth/me`
	| `/user/profile`
	| `/events`
	| `/consent/accept`
	| `/terms`
	| `/admin/terms`
	| `/admin/events`
	| `/admin/users`
	| `/events/mine`
	| `/registrations/my-registrations`
	| `/notifications`
	| `/notifications/unread-count`
	| `/notifications/read-all`
	| `/notifications/${string}/read`
	| `/notifications/${string}`
	| `/registrations/my-registrations`
	| `/registrations/${string}/ticket-token`
	| `/events/${string}/check-in`
	| `/events/${string}/feedback`
	| `/events/${string}/feedback/host-trigger`
	| `/events/${string}/feedback/mine`;
