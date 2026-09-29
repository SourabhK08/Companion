import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as chatController from "../controllers/chat.controller.js";

const router = Router();

// All chat routes require authentication
router.use(authenticate);

// Conversations
router.get("/conversations", chatController.getConversations);
router.post("/conversations", chatController.createConversation);

// Messages within a conversation
router.get("/conversations/:id/messages", chatController.getMessages);
router.post("/conversations/:id/messages", chatController.postMessage);

// Read receipts
router.patch("/conversations/:id/read", chatController.markRead);

// Global unread count
router.get("/unread-count", chatController.getUnreadCount);

export const chatRoutes = router;
