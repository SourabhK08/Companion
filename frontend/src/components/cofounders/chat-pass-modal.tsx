"use client";

import { useState } from "react";
import Link from "next/link";
import { X, MessageCircle, Check, Loader2, Wallet, Infinity as InfinityIcon } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { chatPlans, type ChatPlanId } from "@/config/cofounder-data";

interface ChatPassModalProps {
  open: boolean;
  onClose: () => void;
  onSubscribe: (plan: ChatPlanId) => Promise<void>;
  /** Called after a successful purchase */
  onSuccess?: () => void;
}

/**
 * Pricing modal for the Co-Founder Chat Pass.
 * ₹9 / week · ₹35 / month · ₹100 / 3 months — unlimited chats. Paid from wallet.
 */
export function ChatPassModal({ open, onClose, onSubscribe, onSuccess }: ChatPassModalProps) {
  const [selected, setSelected] = useState<ChatPlanId>("MONTHLY");
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handlePay = async () => {
    setIsPaying(true);
    setError(null);
    try {
      await onSubscribe(selected);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  const isBalanceError = error?.toLowerCase().includes("insufficient");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-deep-plum/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-pass-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-[24px] border border-[#ebd5d9] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-deep-plum via-berry-dark to-berry px-6 pb-6 pt-7 text-white">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white/15">
            <MessageCircle className="size-5" />
          </div>
          <h2 id="chat-pass-title" className="mt-3 text-2xl font-bold">Co-Founder Chat Pass</h2>
          <p className="mt-1 text-sm text-white/70">
            Unlimited chats with founders, builders &amp; partners. No message limits.
          </p>
        </div>

        {/* Plans */}
        <div className="space-y-3 p-6">
          {chatPlans.map((plan) => {
            const active = selected === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan.id)}
                className={cn(
                  "relative flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3.5 text-left transition-all",
                  active ? "border-berry bg-berry/[0.04]" : "border-[#f0dfe3] hover:border-dusty-rose"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border-2",
                      active ? "border-berry bg-berry text-white" : "border-[#d9c3c9]"
                    )}
                  >
                    {active && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{plan.duration}</p>
                    <p className="text-[11px] text-muted-foreground">{plan.perWeek}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {plan.highlight && (
                    <span className="rounded-full bg-berry/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-berry">
                      {plan.highlight}
                    </span>
                  )}
                  <span className="text-xl font-bold text-deep-plum">₹{plan.price}</span>
                </div>
              </button>
            );
          })}

          <ul className="space-y-1.5 pt-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2"><InfinityIcon className="size-3.5 text-berry" /> Unlimited messages with every co-founder profile</li>
            <li className="flex items-center gap-2"><Wallet className="size-3.5 text-berry" /> Paid instantly from your Modhuralap wallet</li>
            <li className="flex items-center gap-2"><Check className="size-3.5 text-berry" /> Buying again extends your current pass</li>
          </ul>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              {error}
              {isBalanceError && (
                <Link href="/wallet" className="ml-1 font-semibold underline">
                  Add money →
                </Link>
              )}
            </div>
          )}

          <Button
            onClick={handlePay}
            disabled={isPaying}
            className="h-11 w-full rounded-xl bg-deep-plum text-sm font-semibold text-white hover:bg-berry-dark"
          >
            {isPaying ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>Pay ₹{chatPlans.find((p) => p.id === selected)?.price} from Wallet</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
