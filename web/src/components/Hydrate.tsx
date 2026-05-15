import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.ts";
import { apiFetch } from "../lib/api.ts";

export function Hydrate() {
	const { isAuthenticated, accessToken, setAccessToken, updateUser, logout } = useAuthStore();

	useEffect(() => {
		// Serialize: refresh first, then load the profile. Firing both in parallel
		// triggers a 401 on /user/profile (no access token yet), which kicks off a
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
				const data = await apiFetch("/user/profile", { method: "GET" });
				if (data?.user) {
					updateUser({ tier: data.user.tier, role: data.user.role });
				}
			} catch {
				// Non-critical — tier defaults to FREE if this fails
			}
		};

		bootstrap();
	}, []);

	return null;
}
