import type { PricingCardProps } from "../components/PricingCard";

export const PricingDetails: Record<string, PricingCardProps> = {
	Basic: {
		title: "Basic",
		price: "₹0",
		description: "Perfect for small meetups and private parties.",
		features: ["Up to 50 attendees", "Basic RSVP tracking", "Email invitations", "Standard event page template"],
		active: false,
		popular: false,
	},
	Pro: {
		title: "Pro",
		price: "₹99",
		description: "Everything you need for professional seminars and workshops.",
		features: [
			"Unlimited attendees",
			"Ticket sales & payments",
			"Custom registration forms",
			"Check-in QR code generator",
			"Basic Analytics",
		],
		active: false,
		popular: true,
	},
	Ultimate: {
		title: "Ultimate",
		price: "₹499",
		description: "Enterprise-grade tools for large-scale conferences.",
		features: [
			"Multi-track scheduling",
			"Whitelabel (Custom Domain)",
			"Speaker & Sponsor portals",
			"API Access & Webhooks",
			"Dedicated 24/7 support",
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
