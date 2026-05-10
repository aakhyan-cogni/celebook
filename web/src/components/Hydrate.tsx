import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.ts";
import { apiFetch } from "../lib/api.ts";

export function Hydrate() {
	const { isAuthenticated, accessToken, setAccessToken, updateUser, logout } = useAuthStore();

	useEffect(() => {
		// Restore access token on page reload (refresh token lives in httpOnly cookie)
		if (isAuthenticated && !accessToken) {
			apiFetch("/auth/refresh", { method: "POST", credentials: "include" })
				.then((data) => setAccessToken(data.accessToken))
				.catch(() => logout());
		}

		// Load tier + role so the FREE tier gate in EventCreationForm works correctly
		if (isAuthenticated) {
			apiFetch("/user/profile", { method: "GET" })
				.then((data) => {
					if (data?.user) {
						updateUser({ tier: data.user.tier, role: data.user.role });
					}
				})
				.catch(() => {
					// Non-critical — tier defaults to FREE if this fails
				});
		}
	}, []);

	return null;
}
