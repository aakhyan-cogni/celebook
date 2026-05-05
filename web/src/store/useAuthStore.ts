import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiFetch } from "../lib/api";

export interface User {
	id: string;
	email: string;
	name: string;
	avatar: string;
	role?: string;
	phoneNumber?: string;
	dob?: string;
	gender?: "Male" | "Female" | "Others";
	country?: string;
	city?: string;
	state?: string;
	zipcode?: string;
	orgName?: string;
	designation?: string;
	companyWebsite?: string;
	bio?: string;
}

interface AuthState {
	user: User | null;
	accessToken: string | null;
	isAuthenticated: boolean;
	consentRequired: boolean;
	pendingRequest: (() => Promise<any>) | null;

	setAuth: (user: User, accessToken: string) => void;
	setAccessToken: (accessToken: string) => void;
	updateUser: (userData: Partial<User>) => void;
	syncUser: (userData: Partial<User>) => Promise<void>;
	logout: () => void;
	setConsentRequired: (value: boolean) => void;
	setPendingRequest: (fn: (() => Promise<any>) | null) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			accessToken: null,
			isAuthenticated: false,
			consentRequired: false,
			pendingRequest: null,

			setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
			setAccessToken: (accessToken) => set({ accessToken }),
			updateUser: (userData) =>
				set((state) => ({
					user: state.user ? { ...state.user, ...userData } : null,
				})),
			syncUser: async (userData) => {
				get().updateUser(userData);
				await apiFetch("/user/profile", {
					method: "PATCH",
					body: JSON.stringify({ data: userData }),
					credentials: "include",
				});
			},

			logout: () => set({ user: null, accessToken: null, isAuthenticated: false, consentRequired: false }),
			setConsentRequired: (value) => set({ consentRequired: value }),
			setPendingRequest: (fn) => set({ pendingRequest: fn }),
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
		},
	),
);
