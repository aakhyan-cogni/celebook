import { UserModel } from "../models/user.model.js";
import { generateAccessToken } from "../lib/jwt.js";

const SYSTEM_PRICING_PLANS = {
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

		const newAccessToken = generateAccessToken({
			userId: updatedUser._id.toString(),
			email:  updatedUser.email,
			role:   updatedUser.role  || "USER",
			tier:   updatedUser.tier  || "FREE",
		});

		return res.status(200).json({
			success: true,
			message: `Account upgraded successfully to the ${planTitle} tier!`,
			data: {
				tier:         updatedUser.tier,
				tierTitle:    REVERSE_TIER_MAPPING[updatedUser.tier],
				accessToken:  newAccessToken,
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