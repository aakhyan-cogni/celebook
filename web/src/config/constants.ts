import type { PricingCardProps } from "../components/PricingCard";

export const PricingDetails: Record<string, PricingCardProps> = {
	Basic: {
		title: "Basic",
		price: "₹0",
		description: "Perfect for small meetups and private gatherings.",
		features: [
			"Up to 2 active events",
			"RSVP & registration tracking",
			"QR code check-in scanner",
			"Attendee feedback collection",
			"Public & unlisted events",
		],
		active: false,
		popular: false,
	},
	Pro: {
		title: "Pro",
		price: "₹99",
		description: "Built for workshops, seminars, and recurring events.",
		features: [
			"Up to 10 active events",
			"Everything in Basic",
			"Image gallery (up to 10 images per event)",
			"Export attendee list to Excel (coming soon)",
			"Team events with flexible capacity modes",
		],
		active: false,
		popular: true,
	},
	Ultimate: {
		title: "Ultimate",
		price: "₹499",
		description: "For organizers running events at scale.",
		features: [
			"Unlimited active events",
			"Everything in Pro",
			"Advanced feedback analytics & summaries",
			"Priority event approval (coming soon)",
			"Cancellation workflow with reason tracking",
		],
		active: false,
		popular: false,
	},
};

export const AVATARS = [
	"default.png",
	"Male_1.jpeg",
	"Female_1.jpeg",
	"Male_2.jpeg",
	"Female_2.jpeg",
	"Male_3.jpg",
	"Female_3.jpeg",
];
