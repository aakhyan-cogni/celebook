import { Router } from "express";
import { getSubscriptionPlans, upgradeUserTier } from "../controllers/plan.controller.js";
import { authenticate } from "../middleware/auth.middleware.js"; 

export const planUpgradeRouter = Router();

// GET /api/plans - Loads plans with active flag relative to the user's current tier
planUpgradeRouter.get("/", authenticate, getSubscriptionPlans);

// POST /api/plans/upgrade - Processes tier changes
planUpgradeRouter.post("/upgrade", authenticate, upgradeUserTier);

