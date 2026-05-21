import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.ts";
import { apiFetch } from "../lib/api.ts";

export function Hydrate() {
	const { isAuthenticated, accessToken, setAccessToken, updateUser, setConsentRequired, logout } = useAuthStore();

	useEffect(() => {
		// Serialize: refresh first, then load /auth/me. Firing both in parallel
		// triggers a 401 on /auth/me (no access token yet), which kicks off a
		// second /auth/refresh inside apiFetch — and the resulting race against the
		// rotating refresh token logs the user out on the loser.
		const bootstrap = async () => {
			if (!isAuthenticated) return;

			if (!accessToken) {
				try {
					const data = await apiFetch("/auth/refresh", { method: "POST", credentials: "include" });
					setAccessToken(data.accessToken);
				} catch {
					logout();
					return;
				}
			}

			try {
				const data = await apiFetch("/auth/me", { method: "GET" });
				if (data?.user) {
					updateUser({ ...data.user });
				}
				setConsentRequired(data?.consent?.needsRenewal === true);
			} catch {
				// Non-critical — leave store as-is on failure.
			}
		};

		bootstrap();
	}, []);

	return null;
}
