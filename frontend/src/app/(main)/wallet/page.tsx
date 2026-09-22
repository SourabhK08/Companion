"use client";

import Link from "next/link";
import {
  Wallet,
  PlusCircle,
  Upload,
  Eye,
  EyeOff,
  Copy,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  ChevronRight,
  ArrowRight,
  Zap,
  ListOrdered,
  CreditCard,
  Lightbulb,
  Headphones,
} from "lucide-react";
import { useState } from "react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { walletData, transactions, type Transaction } from "@/config/wallet-data";

/* ─── Transaction Type Config ─── */

const txnTypeConfig: Record<
  Transaction["type"],
  { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }
> = {
  payment: {
    label: "Payment",
    color: "text-berry",
    bg: "bg-berry/10",
    icon: ArrowUpRight,
  },
  "add-money": {
    label: "Add Money",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    icon: ArrowDownLeft,
  },
  refund: {
    label: "Refund",
    color: "text-amber-600",
    bg: "bg-amber-100",
    icon: RotateCcw,
  },
};

/**
 * Wallet page.
 *
 * Backend-ready architecture:
 *   - Wallet data from mock file (swap with GET /api/users/me/wallet)
 *   - Add Money → opens payment gateway modal (POST /api/wallet/add)
 *   - Withdraw → POST /api/wallet/withdraw
 *   - Transactions → GET /api/wallet/transactions?page=1
 */
export default function WalletPage() {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 xl:flex-row">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* ─── Header Card ─── */}
          <section className="relative overflow-hidden rounded-2xl border border-soft-border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-berry/10">
                  <Wallet className="size-5 text-berry" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">My Wallet</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your balance, add money, and keep track of all transactions.
                  </p>
                </div>
              </div>
              <p className="hidden md:block font-serif text-sm italic text-berry/15 leading-tight text-right">
                More Dates
                <br />
                More Memories ♡
              </p>
            </div>

            {/* Balance Card */}
            <div className="mt-5 rounded-2xl bg-gradient-to-r from-deep-plum via-berry-dark to-berry p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="flex items-center gap-2 text-xs font-medium text-white/70">
                    <span className="flex size-6 items-center justify-center rounded-lg bg-white/10">
                      <Wallet className="size-3 text-white/70" />
                    </span>
                    Available Balance
                  </span>
                  <div className="mt-2 flex items-center gap-3">
                    <p className="text-4xl font-bold text-white sm:text-5xl">
                      {showBalance
                        ? `₹${walletData.balance.toLocaleString("en-IN")}`
                        : "₹ • • • •"}
                    </p>
                    <button
                      onClick={() => setShowBalance((p) => !p)}
                      className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                      aria-label={showBalance ? "Hide balance" : "Show balance"}
                    >
                      {showBalance ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-white/50">
                    <span>Wallet ID: {walletData.walletId}</span>
                    <button
                      className="flex size-5 items-center justify-center rounded bg-white/10 text-white/50 hover:text-white"
                      aria-label="Copy wallet ID"
                    >
                      <Copy className="size-3" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2.5 sm:items-end">
                  <Button className="h-11 rounded-xl bg-white text-berry font-semibold shadow-md hover:bg-dusty-rose hover:text-deep-plum gap-2 px-6">
                    <PlusCircle className="size-4" />
                    Add Money
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl border-white/30 bg-transparent text-white font-semibold hover:bg-white/10 gap-2 px-6"
                  >
                    <Upload className="size-4" />
                    Withdraw
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Stats Row ─── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: ArrowDownLeft,
                iconBg: "bg-emerald-100",
                iconColor: "text-emerald-600",
                label: "Total Deposited",
                value: `₹${walletData.totalDeposited.toLocaleString("en-IN")}`,
                sub: "Last 30 days",
              },
              {
                icon: ArrowUpRight,
                iconBg: "bg-berry/10",
                iconColor: "text-berry",
                label: "Total Spent",
                value: `₹${walletData.totalSpent.toLocaleString("en-IN")}`,
                sub: "Last 30 days",
              },
              {
                icon: ListOrdered,
                iconBg: "bg-amber-100",
                iconColor: "text-amber-600",
                label: "Total Transactions",
                value: walletData.totalTransactions.toString(),
                sub: "This month",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between rounded-2xl border border-soft-border bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("flex size-10 items-center justify-center rounded-xl", stat.iconBg)}>
                    <stat.icon className={cn("size-5", stat.iconColor)} />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/40" />
              </div>
            ))}
          </div>

          {/* ─── Transaction History ─── */}
          <section className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Wallet className="size-5 text-berry" />
                Transaction History
              </h2>
              <Link
                href="#"
                className="flex items-center gap-0.5 text-xs font-semibold text-berry hover:text-berry-dark"
              >
                View All <ArrowRight className="size-3" />
              </Link>
            </div>

            {/* Table Header */}
            <div className="mt-4 hidden border-b border-soft-border pb-2 sm:grid sm:grid-cols-[160px_1fr_100px_100px_80px_32px] sm:gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Date & Time
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Type
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Amount
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </span>
              <span />
            </div>

            {/* Transaction Rows */}
            <div className="mt-2 divide-y divide-soft-border">
              {transactions.map((txn) => {
                const config = txnTypeConfig[txn.type];
                const TxnIcon = config.icon;
                return (
                  <div
                    key={txn.id}
                    className="grid grid-cols-1 gap-2 py-3.5 sm:grid-cols-[160px_1fr_100px_100px_80px_32px] sm:items-center sm:gap-3"
                  >
                    {/* Date */}
                    <div className="flex items-center gap-2.5">
                      <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", config.bg)}>
                        <TxnIcon className={cn("size-3.5", config.color)} />
                      </div>
                      <span className="text-xs text-muted-foreground">{txn.date}</span>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-sm font-semibold text-foreground">{txn.description}</p>
                      <p className="text-[11px] text-muted-foreground">{txn.subtitle}</p>
                    </div>

                    {/* Type */}
                    <span
                      className={cn(
                        "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-semibold",
                        config.bg,
                        config.color
                      )}
                    >
                      {config.label}
                    </span>

                    {/* Amount */}
                    <span
                      className={cn(
                        "text-sm font-bold",
                        txn.amount >= 0 ? "text-emerald-600" : "text-berry"
                      )}
                    >
                      {txn.amount >= 0 ? "+" : "–"} ₹
                      {Math.abs(txn.amount).toLocaleString("en-IN")}
                    </span>

                    {/* Status */}
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                      Success
                    </span>

                    {/* Arrow */}
                    <ChevronRight className="hidden size-4 text-muted-foreground/30 sm:block" />
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ═══ RIGHT SIDEBAR ═══ */}
        <aside className="w-full shrink-0 xl:w-[280px] space-y-5">
          {/* Quick Actions */}
          <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Zap className="size-4 text-berry" />
              Quick Actions
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { icon: PlusCircle, label: "Add Money", href: "#add" },
                { icon: Upload, label: "Withdraw", href: "#withdraw" },
                { icon: ListOrdered, label: "Transaction History", href: "#history" },
                { icon: CreditCard, label: "Payment Methods", href: "#methods" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 rounded-xl border border-soft-border px-3 py-4 text-center transition-colors hover:border-berry/30 hover:bg-berry/5"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-berry/8">
                    <action.icon className="size-5 text-berry" />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Wallet Tips */}
          <div className="flex items-start gap-3 rounded-2xl border border-soft-border bg-white p-5 shadow-sm">
            <div className="flex-1">
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                <Lightbulb className="size-4 text-amber-500" />
                Wallet Tips
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Keep your wallet topped up for a smoother booking experience.
              </p>
            </div>
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-berry/8">
              <Wallet className="size-7 text-berry/40" />
            </div>
          </div>

          {/* Promo Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-deep-plum via-berry-dark to-berry p-5">
            <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white leading-snug">
                More Connections ♡
                <br />
                More Experiences
              </h3>
              <p className="mt-1.5 text-[11px] text-white/50">
                Love, Friendship, Events & Beyond
              </p>
              <Link
                href="/explore"
                className="mt-3 inline-flex h-8 items-center gap-1 rounded-full bg-berry/60 px-4 text-[11px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-berry/80"
              >
                Explore Companions <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>

          {/* Help & Support */}
          <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Headphones className="size-4 text-berry" />
              Help & Support
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Need help with your wallet? Our support team is available 24/7.
            </p>
            <Link
              href="/support"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-berry hover:text-berry-dark"
            >
              Contact Support <ArrowRight className="size-3" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
