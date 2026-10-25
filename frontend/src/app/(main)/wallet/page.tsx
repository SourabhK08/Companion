"use client";

import { useState } from "react";
import {
  Wallet as WalletIcon,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet, useWalletTransactions } from "@/hooks/use-wallet";
import { useRazorpay } from "@/hooks/use-razorpay";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api/client";

/* ─── Transaction Type Config ─── */

const txnTypeConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> ; sign: "+" | "-" }
> = {
  ADD_MONEY: { label: "Added Money", color: "text-emerald-600", bg: "bg-emerald-100", icon: ArrowDownLeft, sign: "+" },
  BOOKING_HOLD: { label: "Hold for Booking", color: "text-amber-600", bg: "bg-amber-100", icon: Lock, sign: "-" },
  BOOKING_DEDUCT: { label: "Booking Payment", color: "text-berry", bg: "bg-berry/10", icon: ArrowUpRight, sign: "-" },
  HOLD_RELEASE: { label: "Hold Released", color: "text-emerald-600", bg: "bg-emerald-100", icon: RotateCcw, sign: "+" },
  EARNING: { label: "Earning", color: "text-emerald-600", bg: "bg-emerald-100", icon: ArrowDownLeft, sign: "+" },
  REFUND: { label: "Refund", color: "text-amber-600", bg: "bg-amber-100", icon: RotateCcw, sign: "+" },
};

/* ─── Types ─── */

interface CreateOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  };
}

interface VerifyPaymentResponse {
  success: boolean;
  data: {
    wallet: {
      balance: number;
      heldAmount: number;
      availableBalance: number;
    };
  };
  message: string;
}

export default function WalletPage() {
  const { wallet, isLoading, balanceInRupees, heldInRupees, availableInRupees, refetch } = useWallet();
  const [txnPage, setTxnPage] = useState(1);
  const { transactions, pagination: txnPagination, isLoading: txnLoading, refetch: refetchTxns } = useWalletTransactions(txnPage);
  const { user } = useAuth();

  const { openCheckout } = useRazorpay({
    userName: user?.fullName,
    userEmail: user?.email,
    userPhone: user?.phone,
  });

  const [showBalance, setShowBalance] = useState(true);
  const [addAmount, setAddAmount] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleAddMoney = async () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) return;

    setIsAdding(true);
    setAddError(null);
    setPaymentSuccess(false);

    try {
      // Step 1: Create order on backend
      const orderRes = await apiFetch<CreateOrderResponse>("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!orderRes.success) {
        throw new Error("Failed to create payment order");
      }

      const { orderId, amount: amountInPaisa, keyId } = orderRes.data;

      // Step 2: Open Razorpay Checkout popup
      const paymentResponse = await openCheckout(orderId, amountInPaisa, keyId);

      // Step 3: Verify payment on backend
      const verifyRes = await apiFetch<VerifyPaymentResponse>("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        }),
      });

      if (verifyRes.success) {
        setPaymentSuccess(true);
        setAddAmount("");
        // Refresh wallet and transactions
        refetch();
        refetchTxns();
        // Auto-hide success message after 5 seconds
        setTimeout(() => setPaymentSuccess(false), 5000);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      // Don't show error for user cancellation
      if (msg !== "Payment cancelled by user") {
        setAddError(msg);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000];

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 min-w-0">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Wallet</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your balance, add funds, and view transaction history.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-6 xl:flex-row">
        {/* ═══ LEFT — Balance + Add Money ═══ */}
        <div className="flex-1 space-y-5">
          {/* Balance Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-deep-plum via-berry-dark to-berry p-6 text-white shadow-lg">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_50%)]" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WalletIcon className="size-5" />
                  <span className="text-sm font-medium text-white/80">Wallet Balance</span>
                </div>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {showBalance ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {isLoading ? (
                <div className="mt-3 h-10 w-40 animate-pulse rounded bg-white/10" />
              ) : (
                <p className="mt-3 text-4xl font-black">
                  {showBalance ? `₹${balanceInRupees.toLocaleString("en-IN")}` : "₹ ••••••"}
                </p>
              )}

              <div className="mt-4 flex gap-6">
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Available</p>
                  <p className="text-sm font-bold">
                    {showBalance ? `₹${availableInRupees.toLocaleString("en-IN")}` : "••••"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">Held</p>
                  <p className="text-sm font-bold text-amber-300">
                    {showBalance ? `₹${heldInRupees.toLocaleString("en-IN")}` : "••••"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Add Money */}
          <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <PlusCircle className="size-5 text-berry" />
              Add Money
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="size-3 text-emerald-600" />
              Secure payment via Razorpay — Cards, UPI, Net Banking
            </p>

            {/* Success banner */}
            {paymentSuccess && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <p className="text-sm font-semibold text-emerald-700">
                  Payment successful! Your wallet has been credited.
                </p>
              </div>
            )}

            {/* Quick amounts */}
            <div className="mt-4 flex flex-wrap gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAddAmount(String(amt))}
                  disabled={isAdding}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    addAmount === String(amt)
                      ? "border-berry bg-berry/10 text-berry"
                      : "border-soft-border text-muted-foreground hover:border-berry/30",
                    isAdding && "opacity-50 cursor-not-allowed"
                  )}
                >
                  ₹{amt.toLocaleString("en-IN")}
                </button>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <Input
                type="number"
                min={1}
                max={50000}
                placeholder="Enter amount (₹)"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                disabled={isAdding}
                className="h-10 flex-1 rounded-xl border-soft-border"
              />
              <Button
                onClick={handleAddMoney}
                disabled={!addAmount || parseFloat(addAmount) <= 0 || isAdding}
                className="h-10 rounded-xl bg-berry hover:bg-berry-dark text-white px-6 font-semibold min-w-[120px]"
              >
                {isAdding ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Processing
                  </span>
                ) : (
                  "Add Money"
                )}
              </Button>
            </div>

            {addError && (
              <p className="mt-2 text-xs font-semibold text-red-600">{addError}</p>
            )}
          </div>
        </div>

        {/* ═══ RIGHT — Transaction History ═══ */}
        <div className="flex-1">
          <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <CreditCard className="size-5 text-berry" />
              Transaction History
            </h2>

            <div className="mt-4 divide-y divide-soft-border">
              {txnLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="size-6 animate-spin rounded-full border-3 border-[#f0dfe3] border-t-berry" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-12 text-center">
                  <WalletIcon className="mx-auto size-10 text-muted-foreground/30" />
                  <p className="mt-3 text-sm font-semibold text-foreground">No transactions yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add money to your wallet to get started.
                  </p>
                </div>
              ) : (
                transactions.map((txn) => {
                  const config = txnTypeConfig[txn.type] || {
                    label: txn.type,
                    color: "text-gray-600",
                    bg: "bg-gray-100",
                    icon: CreditCard,
                    sign: "-" as const,
                  };
                  const Icon = config.icon;
                  const amountInRupees = txn.amount / 100;

                  return (
                    <div key={txn.id} className="flex items-center justify-between py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex size-9 items-center justify-center rounded-full", config.bg)}>
                          <Icon className={cn("size-4", config.color)} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{config.label}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(txn.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-sm font-bold",
                          config.sign === "+" ? "text-emerald-600" : "text-foreground"
                        )}
                      >
                        {config.sign}₹{amountInRupees.toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {txnPagination && txnPagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-3 border-t border-soft-border pt-4">
                <Button
                  variant="outline"
                  onClick={() => setTxnPage((p) => Math.max(1, p - 1))}
                  disabled={txnPage <= 1}
                  className="h-8 rounded-lg text-xs"
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  {txnPage} / {txnPagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setTxnPage((p) => p + 1)}
                  disabled={txnPage >= txnPagination.totalPages}
                  className="h-8 rounded-lg text-xs"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
