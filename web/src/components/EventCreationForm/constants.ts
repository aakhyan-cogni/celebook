export const fadeInUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const TOTAL_STEPS = 4;
export const TIER_IMAGE_LIMITS: Record<string, number> = { FREE: 1, PRO: 5, ULTIMATE: 10 };
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type EventFormData = {
	title: string;
	category: string;
	description: string;
	date: string;
	time: string;
	location: string;
	price: number;
	capacity: number;
	currency: string;
	visibility: string;
	isTeamEvent: boolean;
	minTeamSize: string | number;
	maxTeamSize: string | number;
	teamCapacityMode: string;
};

export const INITIAL_FORM_DATA: EventFormData = {
	title: "",
	category: "Workshop",
	description: "",
	date: "",
	time: "",
	location: "",
	price: 0,
	capacity: 0,
	currency: "INR",
	visibility: "PUBLIC",
	isTeamEvent: false,
	minTeamSize: "",
	maxTeamSize: "",
	teamCapacityMode: "PER_MEMBER",
};
