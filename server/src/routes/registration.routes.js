import { Router } from "express";
import * as RegistrationController from "../controllers/registration.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const registrationRouter = Router();

// GET /api/registrations/mine — Get user's registrations
registrationRouter.get("/mine", authenticate, RegistrationController.getMyRegistrations);

