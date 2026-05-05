import { apiFetch } from "../lib/api";

export function login(email: string, password: string) {
	return apiFetch("/auth/login", {
		method: "POST",
		body: JSON.stringify({ email, password }),
	});
}

export async function register(name: string, email: string, password: string, termsAccepted: boolean, loginAfter = false) {
	if (loginAfter) {
		return apiFetch("/auth/register", {
			method: "POST",
			body: JSON.stringify({ name, email, password, termsAccepted }),
		})
			.then(() => {
				return apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
			})
			.catch((error) => {
				throw new Error(error.message || "Registration failed");
			});
	}
	return apiFetch("/auth/register", {
		method: "POST",
		body: JSON.stringify({ name, email, password, termsAccepted }),
	});
}

export function refreshToken() {
	return apiFetch("/auth/refresh", { method: "POST" });
}

export function logout() {
	return apiFetch("/auth/logout", { method: "POST" });
}
