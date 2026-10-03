import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as notificationService from "../services/notification.service.js";

// ─── GET /api/notifications ──────────────────────────────

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) { res.status(401).json({ success: false, message: "Not authenticated" }); return; }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await notificationService.getNotifications(req.userId, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
}

// ─── GET /api/notifications/unread-count ──────────────────

export async function getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) { res.status(401).json({ success: false, message: "Not authenticated" }); return; }

    const count = await notificationService.getUnreadCount(req.userId);
    res.json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch unread count" });
  }
}

// ─── PATCH /api/notifications/:id/read ────────────────────

export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) { res.status(401).json({ success: false, message: "Not authenticated" }); return; }

    await notificationService.markAsRead(req.params.id as string, req.userId);
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ success: false, message: "Failed to mark notification" });
  }
}

// ─── PATCH /api/notifications/read-all ────────────────────

export async function markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) { res.status(401).json({ success: false, message: "Not authenticated" }); return; }

    await notificationService.markAllAsRead(req.userId);
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ success: false, message: "Failed to mark all notifications" });
  }
}
