import { prisma } from "../lib/prisma.js";
import { AppError } from "./auth.service.js";
import { getOrCreateWallet } from "./wallet.service.js";
import { notify } from "./notification.service.js";

/**
 * Co-Founder chat subscription service.
 *
 * Rules:
 *   - Chat on the platform is EXCLUSIVE to the Co-Founder section.
 *   - To send messages, the sender must:
 *       1. Have a Co-Founder profile (LinkedIn attached)
 *       2. Have an active chat subscription (₹9/week, ₹35/month, ₹100/3 months)
 *   - The recipient must have an active Co-Founder profile.
 *   - Unlimited messages while subscription is active.
 *   - Payment is deducted from the in-app wallet (mock payments).
 *   - Buying while a plan is active EXTENDS the current end date (stacking).
 */

export const PLAN_CONFIG = {
  WEEKLY: { price: 900, label: "1 Week" },       // ₹9
  MONTHLY: { price: 3500, label: "1 Month" },    // ₹35
  QUARTERLY: { price: 10000, label: "3 Months" }, // ₹100
} as const;

export type ChatPlan = keyof typeof PLAN_CONFIG;

function addPlanDuration(from: Date, plan: ChatPlan): Date {
  const end = new Date(from);
  if (plan === "WEEKLY") end.setDate(end.getDate() + 7);
  else if (plan === "MONTHLY") end.setMonth(end.getMonth() + 1);
  else end.setMonth(end.getMonth() + 3);
  return end;
}

// ─── Subscribe (wallet-charged) ───────────────────────────

export async function subscribe(userId: string, plan: ChatPlan) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  const config = PLAN_CONFIG[plan];
  if (!config) throw new AppError(400, "Invalid plan");

  const wallet = await getOrCreateWallet(userId);
  const available = wallet.balance - wallet.heldAmount;
  if (available < config.price) {
    throw new AppError(
      402,
      `Insufficient wallet balance. You need ₹${config.price / 100} but have ₹${(available / 100).toLocaleString("en-IN")}. Please add money to your wallet.`
    );
  }

  // Stack on top of an existing active plan
  const current = await getActiveSubscription(userId);
  const startDate = current ? current.endDate : new Date();
  const endDate = addPlanDuration(startDate, plan);

  const [subscription] = await prisma.$transaction([
    prisma.chatSubscription.create({
      data: {
        userId,
        plan,
        amountPaid: config.price,
        startDate,
        endDate,
        isActive: true,
      },
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: config.price } },
    }),
    prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "SUBSCRIPTION",
        amount: config.price,
        description: `Co-Founder Chat Pass — ${config.label}`,
      },
    }),
  ]);

  const endStr = endDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  await notify({
    userId,
    type: "WALLET",
    title: "Chat Pass Activated 💬",
    body: `₹${config.price / 100} paid for ${config.label} Co-Founder Chat Pass. Unlimited chats till ${endStr}.`,
    icon: "message",
    linkUrl: "/explore/cofounders",
  });

  return subscription;
}

// ─── Queries ──────────────────────────────────────────────

export async function getActiveSubscription(userId: string) {
  const now = new Date();
  return prisma.chatSubscription.findFirst({
    where: { userId, isActive: true, endDate: { gt: now } },
    orderBy: { endDate: "desc" },
  });
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  return !!(await getActiveSubscription(userId));
}

export async function getSubscriptionHistory(userId: string) {
  return prisma.chatSubscription.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Chat Access Guard ────────────────────────────────────

/**
 * Throws a 403 AppError if `senderId` is not allowed to chat with `recipientId`.
 * Used by both the REST "start conversation" endpoint and the Socket.IO send_message handler.
 */
export async function assertChatAccess(senderId: string, recipientId: string) {
  const [senderProfile, recipientProfile] = await Promise.all([
    prisma.coFounderProfile.findUnique({ where: { userId: senderId }, select: { id: true } }),
    prisma.coFounderProfile.findUnique({ where: { userId: recipientId }, select: { id: true, isActive: true } }),
  ]);

  if (!recipientProfile || !recipientProfile.isActive) {
    throw new AppError(403, "Chat is only available with members of the Co-Founder section.");
  }

  if (!senderProfile) {
    throw new AppError(403, "COFOUNDER_PROFILE_REQUIRED: Attach your LinkedIn and create your Co-Founder profile to start chatting.");
  }

  if (!(await hasActiveSubscription(senderId))) {
    throw new AppError(403, "SUBSCRIPTION_REQUIRED: Get a Chat Pass (starting ₹9/week) to chat with co-founders.");
  }
}
