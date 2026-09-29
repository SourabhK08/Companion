import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import * as chatService from "../services/chat.service.js";

/**
 * Map of userId → Set<socketId>
 * A user can have multiple tabs/devices open simultaneously.
 */
const onlineUsers = new Map<string, Set<string>>();

let io: Server;

/**
 * Initialize Socket.IO server on the existing HTTP server.
 */
export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // ─── JWT Auth Middleware for Socket.IO ───────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  // ─── Connection Handler ─────────────────────────────────
  io.on("connection", (socket: Socket) => {
    const userId: string = socket.data.userId;
    console.log(`🔌 User connected: ${userId} (socket: ${socket.id})`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
      // User just came online (first tab) — broadcast to others
      socket.broadcast.emit("user_online", { userId });
    }
    onlineUsers.get(userId)!.add(socket.id);

    // Send current online users list to the newly connected client
    const onlineIds = Array.from(onlineUsers.keys());
    socket.emit("online_users", { userIds: onlineIds });

    // ─── Join Conversation Rooms ──────────────────────────
    socket.on("join_conversation", ({ conversationId }: { conversationId: string }) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on("leave_conversation", ({ conversationId }: { conversationId: string }) => {
      socket.leave(`conv:${conversationId}`);
    });

    // ─── Send Message ─────────────────────────────────────
    socket.on(
      "send_message",
      async ({
        conversationId,
        content,
        type,
      }: {
        conversationId: string;
        content: string;
        type?: string;
      }) => {
        try {
          const message = await chatService.sendMessage(
            conversationId,
            userId,
            content,
            type || "text"
          );

          // Broadcast to all clients in this conversation room (including sender)
          io.to(`conv:${conversationId}`).emit("new_message", {
            message,
            conversationId,
          });

          // Also send to both participants' personal channels
          // (for updating the chat list sidebar even if they haven't joined the conv room)
          const conv = await getConversationParticipants(conversationId);
          if (conv) {
            const recipientId =
              conv.participant1 === userId ? conv.participant2 : conv.participant1;
            emitToUser(recipientId, "new_message_notification", {
              message,
              conversationId,
            });
          }
        } catch (error) {
          socket.emit("error", {
            message: error instanceof Error ? error.message : "Failed to send message",
          });
        }
      }
    );

    // ─── Typing Indicators ────────────────────────────────
    socket.on("typing", ({ conversationId }: { conversationId: string }) => {
      socket.to(`conv:${conversationId}`).emit("typing_start", {
        conversationId,
        userId,
      });
    });

    socket.on("stop_typing", ({ conversationId }: { conversationId: string }) => {
      socket.to(`conv:${conversationId}`).emit("typing_stop", {
        conversationId,
        userId,
      });
    });

    // ─── Mark as Read ─────────────────────────────────────
    socket.on("mark_read", async ({ conversationId }: { conversationId: string }) => {
      try {
        await chatService.markMessagesAsRead(conversationId, userId);

        // Notify the other user that their messages were read
        socket.to(`conv:${conversationId}`).emit("messages_read", {
          conversationId,
          readBy: userId,
        });
      } catch (error) {
        console.error("Mark read socket error:", error);
      }
    });

    // ─── Disconnect ───────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${userId} (socket: ${socket.id})`);

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          // User fully offline (all tabs closed)
          socket.broadcast.emit("user_offline", { userId });
        }
      }
    });
  });

  return io;
}

/**
 * Emit an event to all sockets belonging to a specific user.
 */
function emitToUser(userId: string, event: string, data: unknown) {
  const sockets = onlineUsers.get(userId);
  if (sockets) {
    for (const socketId of sockets) {
      io.to(socketId).emit(event, data);
    }
  }
}

/**
 * Helper to get conversation participants (cached query).
 */
async function getConversationParticipants(conversationId: string) {
  const { prisma } = await import("../lib/prisma.js");
  return prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { participant1: true, participant2: true },
  });
}

/**
 * Get the Socket.IO server instance.
 */
export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

/**
 * Check if a user is currently online.
 */
export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}
