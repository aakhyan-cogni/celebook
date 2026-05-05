import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.ts";
import { apiFetch } from "../lib/api.ts";

export function Hydrate() {
	const { isAuthenticated, accessToken, setAccessToken, logout } = useAuthStore();
	useEffect(() => {
		console.log("Hydrate component mounted. Checking authentication state...");
		if (isAuthenticated && !accessToken) {
			apiFetch("/auth/refresh", { method: "POST", credentials: "include" })
				.then((data) => setAccessToken(data.accessToken))
				.catch(() => logout());
		}
	}, []);
	return null; // This component is just a placeholder for hydration and doesn't render anything
}
