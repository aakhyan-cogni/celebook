export const fadeInUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const TOTAL_STEPS = 3;
export const TIER_IMAGE_LIMITS: Record<string, number> = { FREE: 1, PRO: 5, ULTIMATE: 10 };
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const EVENT_CATEGORIES = [
	"Conference",
	"Workshop",
	"Social",
	"Entertainment",
	"Music",
	"Technology",
	"Sports",
	"Arts",
	"Business",
	"Health & Wellness",
	"Education",
	"Other",
] as const;

export type EventFormData = {
	title: string;
	category: string;
	description: string;
	date: string;
	time: string;
	endDate: string;
	endTime: string;
	location: string;
	price: number;
	capacity: number;
	currency: string;
	visibility: string;
};

export const INITIAL_FORM_DATA: EventFormData = {
	title: "",
	category: "Workshop",
	description: "",
	date: "",
	time: "",
	endDate: "",
	endTime: "",
	location: "",
	price: 0,
	capacity: 0,
	currency: "INR",
	visibility: "PUBLIC",
};
