import { prisma } from "../lib/prisma.js";
import { resolveAvatars } from "./cloudinary.service.js";

// ─── Participant ordering helper ──────────────────────────
// Always store the lexicographically smaller ID as participant1
// to guarantee the @@unique constraint works correctly.
function orderParticipants(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

// ─── Conversation select (includes participant user info) ─
const conversationSelect = {
  id: true,
  participant1: true,
  participant2: true,
  lastMessageAt: true,
  createdAt: true,
  updatedAt: true,
  user1: {
    select: {
      id: true,
      fullName: true,
      avatar: true,
    },
  },
  user2: {
    select: {
      id: true,
      fullName: true,
      avatar: true,
    },
  },
};

// ─── Get or Create Conversation ───────────────────────────

export async function getOrCreateConversation(userId: string, recipientId: string) {
  if (userId === recipientId) {
    throw new Error("Cannot create a conversation with yourself");
  }

  const [p1, p2] = orderParticipants(userId, recipientId);

  // Try to find existing conversation
  let conversation = await prisma.conversation.findUnique({
    where: {
      participant1_participant2: { participant1: p1, participant2: p2 },
    },
    select: conversationSelect,
  });

  // Create if not found
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participant1: p1,
        participant2: p2,
      },
      select: conversationSelect,
    });
  }

  return resolveAvatars(conversation);
}

// ─── Get All Conversations for a User ─────────────────────

export async function getUserConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participant1: userId }, { participant2: userId }],
    },
    select: {
      ...conversationSelect,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          content: true,
          senderId: true,
          type: true,
          isRead: true,
          createdAt: true,
        },
      },
    },
    orderBy: [
      { lastMessageAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
  });

  // Compute unread count for each conversation
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: userId },
          isRead: false,
        },
      });

      const lastMessage = conv.messages[0] || null;

      return {
        id: conv.id,
        participant1: conv.participant1,
        participant2: conv.participant2,
        user1: conv.user1,
        user2: conv.user2,
        lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    })
  );

  return resolveAvatars(conversationsWithUnread);
}

// ─── Get Messages for a Conversation (paginated) ──────────

export async function getConversationMessages(
  conversationId: string,
  userId: string,
  cursor?: string,
  limit: number = 30
) {
  // Verify user is part of the conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ participant1: userId }, { participant2: userId }],
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found or access denied");
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit + 1, // fetch one extra to determine if there are more
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1, // skip the cursor itself
        }
      : {}),
    select: {
      id: true,
      conversationId: true,
      senderId: true,
      content: true,
      type: true,
      isRead: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
  });

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop(); // remove the extra

  return {
    messages: resolveAvatars(messages.reverse()), // oldest first for display
    hasMore,
    nextCursor: hasMore ? messages[0]?.id : undefined,
  };
}

// ─── Send a Message ───────────────────────────────────────

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  type: string = "text"
) {
  // Verify sender is part of conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ participant1: senderId }, { participant2: senderId }],
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found or access denied");
  }

  // Create message and update conversation's lastMessageAt atomically
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        type,
      },
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        content: true,
        type: true,
        isRead: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return resolveAvatars(message);
}

// ─── Mark Messages as Read ────────────────────────────────

export async function markMessagesAsRead(conversationId: string, userId: string) {
  // Verify user is part of the conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ participant1: userId }, { participant2: userId }],
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found or access denied");
  }

  // Mark all messages NOT sent by this user as read
  const result = await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });

  return result.count;
}

// ─── Get Total Unread Count ───────────────────────────────

export async function getTotalUnreadCount(userId: string): Promise<number> {
  // Find all conversation IDs for this user
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participant1: userId }, { participant2: userId }],
    },
    select: { id: true },
  });

  const conversationIds = conversations.map((c) => c.id);

  if (conversationIds.length === 0) return 0;

  return prisma.message.count({
    where: {
      conversationId: { in: conversationIds },
      senderId: { not: userId },
      isRead: false,
    },
  });
}
