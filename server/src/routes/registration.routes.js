import { Router } from "express";
import * as RegistrationController from "../controllers/registration.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const registrationRouter = Router();

// GET /api/registrations/my-registrations — Get user's registrations

// I changed path from /mine to /my-registrations
registrationRouter.get("/my-registrations", authenticate, RegistrationController.getMyRegistrations);
