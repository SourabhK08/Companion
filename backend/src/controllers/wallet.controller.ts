import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as walletService from "../services/wallet.service.js";

// ─── GET /api/wallet ──────────────────────────────────────

export async function getWallet(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const wallet = await walletService.getWallet(req.userId);
    res.json({ success: true, data: { wallet } });
  } catch (error) {
    console.error("Get wallet error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch wallet" });
  }
}

// ─── POST /api/wallet/add-money ───────────────────────────

export async function addMoney(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { amount } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ success: false, message: "Amount must be a positive number (in rupees)" });
      return;
    }

    // Convert rupees to paisa
    const amountInPaisa = Math.round(amount * 100);

    const result = await walletService.addMoney(req.userId, amountInPaisa);
    res.json({
      success: true,
      data: {
        wallet: {
          balance: result.wallet.balance,
          heldAmount: result.wallet.heldAmount,
          availableBalance: result.wallet.balance - result.wallet.heldAmount,
        },
        transaction: result.transaction,
      },
      message: `₹${amount} added to wallet successfully`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add money";
    console.error("Add money error:", error);
    res.status(500).json({ success: false, message });
  }
}

// ─── GET /api/wallet/transactions ─────────────────────────

export async function getTransactions(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await walletService.getTransactions(req.userId, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
}
