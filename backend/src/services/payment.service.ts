import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import * as walletService from "./wallet.service.js";
import { notify } from "./notification.service.js";

// ─── Razorpay SDK Instance ───────────────────────────────

let razorpayInstance: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
    }
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

// ─── Constants ────────────────────────────────────────────

const MIN_AMOUNT_RUPEES = 1;       // ₹1 minimum
const MAX_AMOUNT_RUPEES = 50_000;  // ₹50,000 maximum

// ─── Create Razorpay Order ────────────────────────────────

export async function createOrder(userId: string, amountInRupees: number) {
  // Validate amount
  if (amountInRupees < MIN_AMOUNT_RUPEES || amountInRupees > MAX_AMOUNT_RUPEES) {
    throw new Error(`Amount must be between ₹${MIN_AMOUNT_RUPEES} and ₹${MAX_AMOUNT_RUPEES.toLocaleString("en-IN")}`);
  }

  const amountInPaisa = Math.round(amountInRupees * 100);
  const receipt = `rcpt_${userId.slice(-6)}_${Date.now()}`;

  // Create order on Razorpay
  const razorpay = getRazorpay();
  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaisa,
    currency: "INR",
    receipt,
    notes: {
      userId,
      purpose: "wallet_topup",
    },
  });

  // Save order in our DB for tracking
  const paymentOrder = await prisma.paymentOrder.create({
    data: {
      userId,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaisa,
      currency: "INR",
      status: "CREATED",
      receipt,
    },
  });

  return {
    orderId: razorpayOrder.id,
    amount: amountInPaisa,
    currency: "INR",
    keyId: env.RAZORPAY_KEY_ID!,
    receipt,
    paymentOrderId: paymentOrder.id,
  };
}

// ─── Verify Payment (Frontend Callback) ───────────────────

export async function verifyPayment(
  userId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  // 1. Verify the signature (HMAC SHA256)
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new Error("Payment verification failed: invalid signature");
  }

  // 2. Find the payment order in our DB
  const paymentOrder = await prisma.paymentOrder.findUnique({
    where: { razorpayOrderId },
  });

  if (!paymentOrder) {
    throw new Error("Payment order not found");
  }

  if (paymentOrder.userId !== userId) {
    throw new Error("Payment order does not belong to this user");
  }

  // 3. Idempotency check: if already credited, just return the wallet
  if (paymentOrder.walletCredited) {
    const wallet = await walletService.getWallet(userId);
    return { wallet, alreadyCredited: true };
  }

  // 4. Credit wallet + update payment order in a single transaction
  const amountInPaisa = paymentOrder.amount;

  const walletData = await walletService.getOrCreateWallet(userId);

  await prisma.$transaction([
    // Mark payment order as PAID
    prisma.paymentOrder.update({
      where: { id: paymentOrder.id },
      data: {
        status: "PAID",
        razorpayPaymentId,
        walletCredited: true,
      },
    }),
    // Credit the wallet
    prisma.wallet.update({
      where: { id: walletData.id },
      data: { balance: { increment: amountInPaisa } },
    }),
    // Create the transaction record
    prisma.walletTransaction.create({
      data: {
        walletId: walletData.id,
        type: "ADD_MONEY",
        amount: amountInPaisa,
        description: `Added ₹${(amountInPaisa / 100).toLocaleString("en-IN")} via Razorpay`,
      },
    }),
  ]);

  // 5. Send notification
  const amountInRupees = amountInPaisa / 100;
  const updatedWallet = await walletService.getWallet(userId);

  await notify({
    userId,
    type: "WALLET",
    title: "Money Added Successfully 💰",
    body: `₹${amountInRupees.toLocaleString("en-IN")} has been added to your wallet. Your new balance is ₹${updatedWallet.availableBalance / 100}.`,
    icon: "wallet",
    linkUrl: "/wallet",
  });

  return { wallet: updatedWallet, alreadyCredited: false };
}

// ─── Verify Webhook (Razorpay → Backend) ──────────────────

export async function handleWebhook(rawBody: Buffer, signature: string) {
  // 1. Verify webhook signature
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    console.warn("RAZORPAY_WEBHOOK_SECRET not set — skipping webhook verification");
    return { status: "skipped", reason: "webhook_secret_not_configured" };
  }

  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    throw new Error("Webhook signature verification failed");
  }

  // 2. Parse the event
  const event = JSON.parse(rawBody.toString());
  const eventType = event.event;

  if (eventType === "payment.captured") {
    const payment = event.payload.payment.entity;
    const razorpayOrderId = payment.order_id;
    const razorpayPaymentId = payment.id;

    // Find the order
    const paymentOrder = await prisma.paymentOrder.findUnique({
      where: { razorpayOrderId },
    });

    if (!paymentOrder) {
      console.warn(`Webhook: no order found for ${razorpayOrderId}`);
      return { status: "ignored", reason: "order_not_found" };
    }

    // Idempotency: skip if already credited
    if (paymentOrder.walletCredited) {
      return { status: "already_processed" };
    }

    // Credit the wallet
    const walletData = await walletService.getOrCreateWallet(paymentOrder.userId);

    await prisma.$transaction([
      prisma.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: {
          status: "PAID",
          razorpayPaymentId,
          walletCredited: true,
        },
      }),
      prisma.wallet.update({
        where: { id: walletData.id },
        data: { balance: { increment: paymentOrder.amount } },
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: walletData.id,
          type: "ADD_MONEY",
          amount: paymentOrder.amount,
          description: `Added ₹${(paymentOrder.amount / 100).toLocaleString("en-IN")} via Razorpay (webhook)`,
        },
      }),
    ]);

    // Notify user
    await notify({
      userId: paymentOrder.userId,
      type: "WALLET",
      title: "Money Added Successfully 💰",
      body: `₹${(paymentOrder.amount / 100).toLocaleString("en-IN")} has been added to your wallet.`,
      icon: "wallet",
      linkUrl: "/wallet",
    });

    return { status: "processed" };
  }

  if (eventType === "payment.failed") {
    const payment = event.payload.payment.entity;
    const razorpayOrderId = payment.order_id;

    await prisma.paymentOrder.updateMany({
      where: { razorpayOrderId, status: "CREATED" },
      data: { status: "FAILED" },
    });

    return { status: "marked_failed" };
  }

  return { status: "ignored", reason: `unhandled_event: ${eventType}` };
}
