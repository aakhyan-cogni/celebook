export interface TabConfig {
	id: string;
	label: string;
	icon: string;
	hoverWidth: string;
	buttonClass: string;
}

export const TABS: TabConfig[] = [
	{
		id: "dashboard",
		label: "Dashboard",
		icon: "🗓️",
		hoverWidth: "70%",
		buttonClass: "btn outline-none decoration m-1 mb-0 ms-2 text-start px-3 pt-2 border-none ",
	},
	{
		id: "events",
		label: "Events",
		icon: "📢",
		hoverWidth: "65%",
		buttonClass: "btn m-1 ms-2 text-start px-3 py-2 border-none",
	},
	{
		id: "bookings",
		label: "Bookings",
		icon: "👥",
		hoverWidth: "65%",
		buttonClass: "btn m-1 ms-2 text-start px-3 py-2 border-none",
	},
	{
		id: "history",
		label: "Booking History",
		icon: "🧾",
		hoverWidth: "80%",
		buttonClass: "btn m-1 ms-2 text-start px-3 py-2 border-none",
	},
	{
		id: "personal",
		label: "Personal Details",
		icon: "👤",
		hoverWidth: "80%",
		buttonClass: "btn m-1 ms-2 text-start px-3 py-2 border-none",
	},
	{
		id: "payment",
		label: "Payment Details",
		icon: "💰",
		hoverWidth: "80%",
		buttonClass: "btn m-1 ms-2 text-start px-3 py-2 border-none",
	},
];
