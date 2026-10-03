import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as notifController from "../controllers/notification.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", notifController.getNotifications);
router.get("/unread-count", notifController.getUnreadCount);
router.patch("/read-all", notifController.markAllAsRead);
router.patch("/:id/read", notifController.markAsRead);

export const notificationRoutes = router;
