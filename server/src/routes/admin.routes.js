import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import * as AdminController from "../controllers/admin.controller.js";

export const adminRouter = Router();

const adminOnlyMiddleware = [authenticate, authorize(["ADMIN"])];
adminRouter.use(...adminOnlyMiddleware);

adminRouter.get("/users", AdminController.listUsers);
adminRouter.get("/events", AdminController.listEvents);
adminRouter.get("/stats", AdminController.getStats);

adminRouter.patch("/users/:id/role", AdminController.updateUserRole);
adminRouter.patch("/events/:id/approve", AdminController.approveEvent);
adminRouter.patch("/events/:id/reject", AdminController.rejectEvent);

adminRouter.get("/terms", AdminController.getTerms);
adminRouter.put("/terms", AdminController.updateTerms);
