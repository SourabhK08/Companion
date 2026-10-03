import { prisma } from "../lib/prisma.js";
import { emitToUser } from "../lib/socket.js";

// ─── Types ────────────────────────────────────────────────

interface CreateNotificationInput {
  userId: string;
  type: "WALLET" | "BOOKING" | "MEETING" | "SYSTEM" | "PROMO";
  title: string;
  body: string;
  icon?: string;
  linkUrl?: string;
}

// ─── Create & Push Notification ───────────────────────────

export async function notify(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      icon: input.icon,
      linkUrl: input.linkUrl,
    },
  });

  // Push real-time via Socket.IO
  emitToUser(input.userId, "new_notification", { notification });

  return notification;
}

// ─── Batch Notify (same content to multiple users) ────────

export async function notifyMany(userIds: string[], input: Omit<CreateNotificationInput, "userId">) {
  const notifications = await prisma.$transaction(
    userIds.map((userId) =>
      prisma.notification.create({
        data: {
          userId,
          type: input.type,
          title: input.title,
          body: input.body,
          icon: input.icon,
          linkUrl: input.linkUrl,
        },
      })
    )
  );

  // Push real-time
  for (let i = 0; i < userIds.length; i++) {
    emitToUser(userIds[i], "new_notification", { notification: notifications[i] });
  }

  return notifications;
}

// ─── Get Notifications (paginated) ────────────────────────

export async function getNotifications(userId: string, page: number = 1, limit: number = 20) {
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Get Unread Count ─────────────────────────────────────

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

// ─── Mark as Read ─────────────────────────────────────────

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

// ─── Mark All as Read ─────────────────────────────────────

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
