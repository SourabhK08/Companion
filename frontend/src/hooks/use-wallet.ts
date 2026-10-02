"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────

interface WalletData {
  balance: number;       // in paisa
  heldAmount: number;    // in paisa
  availableBalance: number; // in paisa
}

interface WalletTransaction {
  id: string;
  type: string;
  amount: number;        // in paisa
  description: string;
  bookingId: string | null;
  createdAt: string;
}

interface WalletTransactionsResponse {
  success: boolean;
  data: {
    transactions: WalletTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// ─── useWallet Hook ───────────────────────────────────────

export function useWallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ success: boolean; data: { wallet: WalletData } }>("/api/wallet");
      if (res.success) {
        setWallet(res.data.wallet);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch wallet");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const addMoney = useCallback(async (amountInRupees: number) => {
    try {
      const res = await apiFetch<{ success: boolean; data: { wallet: WalletData }; message: string }>(
        "/api/wallet/add-money",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountInRupees }),
        }
      );
      if (res.success) {
        setWallet(res.data.wallet);
      }
      return res;
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    wallet,
    isLoading,
    error,
    addMoney,
    refetch: fetchWallet,
    // Helpers: convert paisa to rupees for display
    balanceInRupees: wallet ? wallet.balance / 100 : 0,
    heldInRupees: wallet ? wallet.heldAmount / 100 : 0,
    availableInRupees: wallet ? wallet.availableBalance / 100 : 0,
  };
}

// ─── useWalletTransactions Hook ───────────────────────────

export function useWalletTransactions(page: number = 1, limit: number = 20) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch<WalletTransactionsResponse>(
        `/api/wallet/transactions?page=${page}&limit=${limit}`
      );
      if (res.success) {
        setTransactions(res.data.transactions);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, pagination, isLoading, refetch: fetchTransactions };
}
