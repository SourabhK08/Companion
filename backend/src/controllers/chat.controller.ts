import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as chatService from "../services/chat.service.js";
import { assertChatAccess } from "../services/chat-subscription.service.js";
import { AppError } from "../services/auth.service.js";

// ─── POST /api/chat/conversations ─────────────────────────

export async function createConversation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const { recipientId } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (!recipientId || typeof recipientId !== "string") {
      res.status(400).json({ success: false, message: "recipientId is required" });
      return;
    }

    await assertChatAccess(userId, recipientId);
    const conversation = await chatService.getOrCreateConversation(userId, recipientId);

    res.status(200).json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    const message = error instanceof Error ? error.message : "Failed to create conversation";
    console.error("Create conversation error:", error);
    res.status(500).json({ success: false, message });
  }
}

// ─── GET /api/chat/conversations ──────────────────────────

export async function getConversations(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const conversations = await chatService.getUserConversations(userId);

    res.status(200).json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch conversations" });
  }
}

// ─── GET /api/chat/conversations/:id/messages ─────────────

export async function getMessages(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const conversationId = req.params.id as string;
    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt(req.query.limit as string) || 30;

    if (!userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const result = await chatService.getConversationMessages(
      conversationId,
      userId,
      cursor,
      limit
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch messages";
    console.error("Get messages error:", error);
    res.status(error instanceof Error && error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message,
    });
  }
}

// ─── POST /api/chat/conversations/:id/messages ────────────

export async function postMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const conversationId = req.params.id as string;
    const { content, type } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      res.status(400).json({ success: false, message: "Message content is required" });
      return;
    }

    const message = await chatService.sendMessage(
      conversationId,
      userId,
      content.trim(),
      type || "text"
    );

    res.status(201).json({
      success: true,
      data: { message },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send message";
    console.error("Post message error:", error);
    res.status(500).json({ success: false, message });
  }
}

// ─── PATCH /api/chat/conversations/:id/read ───────────────

export async function markRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const conversationId = req.params.id as string;

    if (!userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const count = await chatService.markMessagesAsRead(conversationId, userId);

    res.status(200).json({
      success: true,
      data: { markedAsRead: count },
    });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ success: false, message: "Failed to mark as read" });
  }
}

// ─── GET /api/chat/unread-count ───────────────────────────

export async function getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const count = await chatService.getTotalUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ success: false, message: "Failed to get unread count" });
  }
}
