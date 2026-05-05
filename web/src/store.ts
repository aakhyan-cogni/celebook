import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
	user: User | null;
	users: User[];
	events: Event[];
	setUser: (data: User | ((obj: User) => User) | null) => void;
	addUser: (data: User) => void;
	deleteUser: (email: string) => void;
	addEvent: (eventData: Omit<Event, "id" | "organizerEmail" | "createdAt">) => void;
}

export interface User {
	id?: string;
	name: string;
	email: string;
	password: string;
	avatar?: string;
	phoneNumber?: string;
	dob?: string;
	gender?: Gender;
	country?: string;
	city?: string;
	state?: string;
	zipcode?: string;
	orgName?: string;
	role?: string;
	companyWebsite?: string;
	bio?: string;
}

export interface Event {
	id: string;
	organizerEmail: string; // Linked to User.email
	title: string;
	category: string;
	description: string;
	date: string;
	location: string;
	price: number;
	capacity: number;
	createdAt: string;
}

type Gender = "Male" | "Female" | "Others";

export const useLocalDB = create<State>()(
	persist(
		(set, get) => ({
			user: null,
			users: [],
			events: [],
			setUser(data) {
				if (typeof data !== "function") {
					set({ user: data });
				} else {
					set((state) => {
						if (!state.user) return state;
						const newUser = data(state.user);
						const updatedUsers = state.users.map((u) => {
							if (u.email === newUser.email) return newUser;
							return u;
						});
						return { user: newUser, users: updatedUsers };
					});
				}
			},
			addUser(data) {
				set((curr) => {
					return { users: [...curr.users, data] };
				});
			},
			deleteUser(email) {
				set((state) => {
					return {
						users: state.users.filter((u) => u.email !== email),
					};
				});
			},
			addEvent(eventData) {
				const currentUser = get().user;

				if (!currentUser) {
					console.error("No logged-in user found to organize the event.");
					return;
				}

				const newEvent: Event = {
					...eventData,
					id: `EVT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
					organizerEmail: currentUser.email,
					createdAt: new Date().toISOString(),
				};

				set((state) => ({
					events: [...state.events, newEvent],
				}));
			},
		}),
		{
			name: "localDB",
		},
	),
);
