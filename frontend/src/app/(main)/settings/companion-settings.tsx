"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api/client";
import { Star, ShieldCheck, Banknote, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompanionSettings() {
  const { user, refreshUser } = useAuth();
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // If already a companion, show management UI
  if (user?.isCompanion) {
    return (
      <main className="lg:col-span-6 space-y-6">
        <div className="flex items-center gap-3 rounded-2xl border border-soft-border bg-white p-5 shadow-xs">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-berry/10 text-berry">
            <Star className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground sm:text-lg">
              Companion Profile
            </h2>
            <p className="text-xs text-muted-foreground">
              You are officially listed as a companion! Manage your availability and rates here.
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-soft-border bg-white p-5 shadow-xs">
          <p className="text-sm font-medium text-muted-foreground">
            Companion dashboard features (Availability toggle, earnings) coming in the next phase!
          </p>
        </section>
      </main>
    );
  }

  // Onboarding UI
  const handleOnboard = async () => {
    if (!hourlyRate) return;
    setIsSubmitting(true);
    
    try {
      const response = await apiFetch<{ success: boolean; data: any }>("/api/companions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hourlyRate: parseInt(hourlyRate, 10),
        }),
      });
      
      if (response.success) {
        setSuccess(true);
        await refreshUser?.();
      }
    } catch (error) {
      console.error("Failed to create companion profile", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="lg:col-span-6 space-y-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/50 p-10 text-center shadow-xs">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <ShieldCheck className="size-8" />
          </div>
          <h2 className="text-2xl font-bold text-emerald-800">You're now a Companion!</h2>
          <p className="mt-2 text-sm text-emerald-600 max-w-sm">
            Your profile is now listed on the Explore page. Start receiving requests and earning money today.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="lg:col-span-6 space-y-6">
      <div className="flex items-center gap-3 rounded-2xl border border-soft-border bg-white p-5 shadow-xs">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-berry/10 text-berry">
          <Star className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground sm:text-lg">
            Become a Companion
          </h2>
          <p className="text-xs text-muted-foreground">
            Set your hourly rate and start earning by chatting and meeting new people.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-soft-border bg-white p-6 shadow-xs">
        <div className="mb-6 rounded-xl bg-berry/5 p-4 border border-berry/10">
          <h3 className="font-semibold text-berry text-sm">How it works</h3>
          <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
            <li>✨ Your profile will be listed publicly on the Explore page.</li>
            <li>💸 You set your own hourly rate (you keep 100% during beta).</li>
            <li>📅 You have full control over who you accept or decline.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-foreground">
            What is your desired hourly rate? (₹)
          </label>
          <div className="relative max-w-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-muted-foreground sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              min="0"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="block w-full rounded-xl border border-soft-border py-2.5 pl-7 pr-12 text-foreground focus:border-berry focus:ring-berry sm:text-sm"
              placeholder="e.g. 500"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-muted-foreground sm:text-sm">/hr</span>
            </div>
          </div>

          <Button
            onClick={handleOnboard}
            disabled={!hourlyRate || isSubmitting}
            className="w-full max-w-xs mt-6 h-11 rounded-xl bg-berry text-white hover:bg-berry-dark"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                List My Profile
                <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </div>
      </section>
    </main>
  );
}
