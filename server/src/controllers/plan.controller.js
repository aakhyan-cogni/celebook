import { UserModel } from "../models/user.model.js";

const SYSTEM_PRICING_PLANS = {
	Basic: {
		title: "Basic",
		price: "₹0",
		description: "Perfect for small meetups and private parties.",
		features: ["Up to 50 attendees", "Basic RSVP tracking", "Email invitations", "Standard event page template"],
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
		popular: false,
	},
};

const TIER_MAPPING = {
	Basic: "FREE",
	Pro: "PRO",
	Ultimate: "ULTIMATE",
};

const REVERSE_TIER_MAPPING = {
	FREE: "Basic",
	PRO: "Pro",
	ULTIMATE: "Ultimate",
};

export const getSubscriptionPlans = async (req, res) => {
	try {
		// ✅ Fixed: JWT payload uses `id`, not `_id`
		const userId = req.user?.id || req.user?.userId;
		const user = await UserModel.findById(userId);

		const currentActiveTitle = user ? REVERSE_TIER_MAPPING[user.tier] : "Basic";

		const formattedPlans = Object.keys(SYSTEM_PRICING_PLANS).reduce((acc, currentKey) => {
			acc[currentKey] = {
				...SYSTEM_PRICING_PLANS[currentKey],
				active: currentKey === currentActiveTitle,
			};
			return acc;
		}, {});

		return res.status(200).json({
			success: true,
			currentTier: user?.tier || "FREE",
			currentTierTitle: currentActiveTitle,
			plans: formattedPlans,
		});
	} catch (error) {
		console.error("Error retrieving pricing structures:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to download current pricing details.",
		});
	}
};

export const upgradeUserTier = async (req, res) => {
	try {
		const { planTitle } = req.body;

		if (!planTitle || !TIER_MAPPING[planTitle]) {
			return res.status(400).json({
				success: false,
				message: "Invalid selection. Please choose a valid plan tier.",
			});
		}

		const targetDbTier = TIER_MAPPING[planTitle];

		// ✅ Fixed: JWT payload uses `id`, not `_id`
		const userId = req.user?.id || req.user?.userId;
		const updatedUser = await UserModel.findByIdAndUpdate(
			userId,
			{ $set: { tier: targetDbTier } },
			{ new: true }
		).select("-password -refreshToken");

		if (!updatedUser) {
			return res.status(404).json({
				success: false,
				message: "User account could not be found.",
			});
		}

		return res.status(200).json({
			success: true,
			message: `Account upgraded successfully to the ${planTitle} tier!`,
			data: {
				tier: updatedUser.tier,
				tierTitle: REVERSE_TIER_MAPPING[updatedUser.tier],
			},
		});
	} catch (error) {
		console.error("Error executing membership shift:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error. Failed to execute subscription upgrade.",
		});
	}
};