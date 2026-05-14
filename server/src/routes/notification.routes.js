import { Router } from "express";
import * as NotificationController from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get("/", NotificationController.listNotifications);
notificationRouter.get("/unread-count", NotificationController.getUnreadCount);
notificationRouter.patch("/read-all", NotificationController.markAllAsRead);
notificationRouter.patch("/:id/read", NotificationController.markAsRead);
notificationRouter.delete("/:id", NotificationController.deleteNotification);
