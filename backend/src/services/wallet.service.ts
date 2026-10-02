import { prisma } from "../lib/prisma.js";

// ─── Constants ────────────────────────────────────────────
const PLATFORM_FEE_PERCENT = 10; // 10% platform fee

// ─── Get or Create Wallet ─────────────────────────────────

export async function getOrCreateWallet(userId: string) {
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId },
    });
  }

  return wallet;
}

// ─── Get Wallet with Balance ──────────────────────────────

export async function getWallet(userId: string) {
  const wallet = await getOrCreateWallet(userId);
  return {
    id: wallet.id,
    balance: wallet.balance,
    heldAmount: wallet.heldAmount,
    availableBalance: wallet.balance - wallet.heldAmount,
  };
}

// ─── Add Money (Mock) ─────────────────────────────────────

export async function addMoney(userId: string, amountInPaisa: number) {
  if (amountInPaisa <= 0) {
    throw new Error("Amount must be positive");
  }

  const wallet = await getOrCreateWallet(userId);

  const [updatedWallet, transaction] = await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amountInPaisa } },
    }),
    prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "ADD_MONEY",
        amount: amountInPaisa,
        description: `Added ₹${(amountInPaisa / 100).toLocaleString("en-IN")} to wallet`,
      },
    }),
  ]);

  return { wallet: updatedWallet, transaction };
}

// ─── Hold Amount for Booking ──────────────────────────────

export async function holdAmount(
  userId: string,
  amountInPaisa: number,
  bookingId: string
) {
  const wallet = await getOrCreateWallet(userId);
  const available = wallet.balance - wallet.heldAmount;

  if (available < amountInPaisa) {
    throw new Error(
      `Insufficient balance. Available: ₹${(available / 100).toFixed(2)}, Required: ₹${(amountInPaisa / 100).toFixed(2)}`
    );
  }

  const [updatedWallet] = await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { heldAmount: { increment: amountInPaisa } },
    }),
    prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "BOOKING_HOLD",
        amount: amountInPaisa,
        description: `Amount held for booking`,
        bookingId,
      },
    }),
  ]);

  return updatedWallet;
}

// ─── Release Held Amount (on reject/cancel/expiry) ────────

export async function releaseHold(
  userId: string,
  amountInPaisa: number,
  bookingId: string,
  reason: string
) {
  const wallet = await getOrCreateWallet(userId);

  const [updatedWallet] = await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { heldAmount: { decrement: amountInPaisa } },
    }),
    prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "HOLD_RELEASE",
        amount: amountInPaisa,
        description: `Hold released: ${reason}`,
        bookingId,
      },
    }),
  ]);

  return updatedWallet;
}

// ─── Deduct Held Amount & Credit Companion (on meeting complete) ─

export async function settleBooking(
  clientUserId: string,
  companionUserId: string,
  totalAmount: number,
  platformFee: number,
  bookingId: string
) {
  const clientWallet = await getOrCreateWallet(clientUserId);
  const companionWallet = await getOrCreateWallet(companionUserId);

  const companionEarning = totalAmount - platformFee;

  await prisma.$transaction([
    // Deduct from client: reduce balance & held
    prisma.wallet.update({
      where: { id: clientWallet.id },
      data: {
        balance: { decrement: totalAmount },
        heldAmount: { decrement: totalAmount },
      },
    }),
    prisma.walletTransaction.create({
      data: {
        walletId: clientWallet.id,
        type: "BOOKING_DEDUCT",
        amount: totalAmount,
        description: `Payment for completed booking`,
        bookingId,
      },
    }),
    // Credit companion earnings
    prisma.wallet.update({
      where: { id: companionWallet.id },
      data: { balance: { increment: companionEarning } },
    }),
    prisma.walletTransaction.create({
      data: {
        walletId: companionWallet.id,
        type: "EARNING",
        amount: companionEarning,
        description: `Earning from booking (after ${PLATFORM_FEE_PERCENT}% platform fee)`,
        bookingId,
      },
    }),
  ]);
}

// ─── Get Transaction History ──────────────────────────────

export async function getTransactions(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const wallet = await getOrCreateWallet(userId);

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.walletTransaction.count({
      where: { walletId: wallet.id },
    }),
  ]);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
