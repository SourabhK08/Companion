"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Check,
  CalendarDays,
  Clock,
  MapPin,
  Star,
  BadgeCheck,
  ShieldCheck,
  Lock,
  ArrowRight,
  Wallet,
  Users,
  Headphones,
  RotateCcw,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCompanion } from "@/hooks/use-companion";
import { useWallet } from "@/hooks/use-wallet";
import { useBookingActions } from "@/hooks/use-bookings";

/* ─── Progress Step Component ─── */

function ProgressStep({
  step,
  label,
  isActive,
  isCompleted,
}: {
  step: number;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
          isCompleted
            ? "bg-emerald-500 text-white"
            : isActive
              ? "bg-berry text-white ring-4 ring-berry/20"
              : "border border-soft-border bg-white text-muted-foreground"
        )}
      >
        {isCompleted ? <Check className="size-3.5" /> : step}
      </div>
      <span
        className={cn(
          "hidden text-sm font-medium sm:inline",
          isActive ? "text-berry" : isCompleted ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Checkout Content ─── */

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companionId = searchParams.get("companion") || "";

  const { companion, isLoading: companionLoading } = useCompanion(companionId);
  const { availableInRupees, isLoading: walletLoading } = useWallet();
  const { createBooking, isSubmitting } = useBookingActions();

  // Form state
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [durationHours, setDurationHours] = useState(1);
  const [venue, setVenue] = useState("");
  const [note, setNote] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeCommunity, setAgreeCommunity] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Pricing calculations
  const hourlyRate = companion?.pricePerHour || 0;
  const subtotal = hourlyRate * durationHours;
  const platformFee = Math.round(subtotal * 0.1);
  const totalAmount = subtotal + platformFee;
  const hasSufficientBalance = availableInRupees >= totalAmount;

  const handleSubmit = async () => {
    if (!companion || !scheduledDate || !scheduledTime) return;
    setBookingError(null);

    try {
      const dateTime = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      const res = await createBooking({
        companionProfileId: companion.id,
        scheduledDate: dateTime,
        durationHours,
        venue: venue || undefined,
        note: note || undefined,
      });

      if (res.success) {
        router.push(`/bookings?highlight=${res.data.booking.id}`);
      }
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Failed to create booking");
    }
  };

  if (companionLoading || walletLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 animate-spin rounded-full border-4 border-[#f0dfe3] border-t-[#7a1f39]" />
          <p className="text-sm font-medium text-[#7a1f39]">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!companion) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">Companion not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">The companion you're looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push("/explore")} className="mt-4 rounded-full bg-berry hover:bg-berry-dark text-white">
            Explore Companions
          </Button>
        </div>
      </div>
    );
  }

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      {/* ═══ PROGRESS STEPPER ═══ */}
      <div className="flex items-center justify-between sm:justify-start sm:gap-0">
        <ProgressStep step={1} label="Booking Details" isActive={true} isCompleted={false} />
        <div className="mx-2 hidden h-px w-16 bg-soft-border sm:block lg:w-24" aria-hidden="true" />
        <ProgressStep step={2} label="Payment" isActive={false} isCompleted={false} />
        <div className="mx-2 hidden h-px w-16 bg-soft-border sm:block lg:w-24" aria-hidden="true" />
        <ProgressStep step={3} label="Confirmation" isActive={false} isCompleted={false} />
      </div>

      {/* ═══ HEADING ═══ */}
      <div className="mt-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Book {companion.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the details below to send a booking request.
        </p>
      </div>

      {/* ═══ MAIN 2-COLUMN LAYOUT ═══ */}
      <div className="mt-6 flex flex-col gap-6 xl:flex-row">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* ─── Companion Info ─── */}
          <section className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Users className="size-5 text-berry" />
              Companion Details
            </h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="size-16 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-dusty-rose to-berry flex items-center justify-center text-white text-lg font-bold">
                {companion.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={companion.avatar}
                    alt={companion.name}
                    className="size-full object-cover"
                  />
                ) : (
                  companion.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-foreground">{companion.name}</h3>
                  {companion.isVerified && <BadgeCheck className="size-4 text-sky-500" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {companion.age} years · {companion.city}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  <Star className="size-3.5 text-amber-500" fill="currentColor" />
                  <span className="text-sm font-semibold">{companion.rating}</span>
                  <span className="text-xs text-muted-foreground">({companion.reviews} reviews)</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {companion.interests.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-md border border-soft-border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {/* ─── Booking Details Form ─── */}
          <section className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-foreground">Booking Details</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="date" className="text-sm font-semibold text-foreground">
                  <CalendarDays className="inline size-3.5 mr-1 text-berry" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  min={minDate}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="mt-1.5 h-10 rounded-xl border-soft-border"
                />
              </div>
              <div>
                <Label htmlFor="time" className="text-sm font-semibold text-foreground">
                  <Clock className="inline size-3.5 mr-1 text-berry" />
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="mt-1.5 h-10 rounded-xl border-soft-border"
                />
              </div>
              <div>
                <Label htmlFor="duration" className="text-sm font-semibold text-foreground">
                  Duration (hours)
                </Label>
                <select
                  id="duration"
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseInt(e.target.value))}
                  className="mt-1.5 flex h-10 w-full rounded-xl border border-soft-border bg-white px-3 py-2 text-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                    <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="venue" className="text-sm font-semibold text-foreground">
                  <MapPin className="inline size-3.5 mr-1 text-berry" />
                  Meeting Point (optional)
                </Label>
                <Input
                  id="venue"
                  type="text"
                  placeholder="e.g., Park Street Cafe"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="mt-1.5 h-10 rounded-xl border-soft-border"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="note" className="text-sm font-semibold text-foreground">
                Message to Companion (optional)
              </Label>
              <textarea
                id="note"
                placeholder="Introduce yourself or mention what you'd like to do..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-soft-border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:border-berry focus:ring-1 focus:ring-berry/20"
              />
            </div>
          </section>

          {/* ─── Safety & Community Guidelines ─── */}
          <section className="rounded-2xl border border-berry/20 bg-berry/5 p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-berry/15">
                <ShieldCheck className="size-4 text-berry" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-foreground">
                  Let&apos;s Keep It Safe, Respectful and Comfortable
                </h2>
                <p className="mt-1 text-xs font-medium text-foreground/80">
                  Do not harass, abuse or perform any offensive act that makes the other person uncomfortable.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2.5">
              <Checkbox
                id="community-agree"
                checked={agreeCommunity}
                onCheckedChange={(checked) => setAgreeCommunity(checked === true)}
                className="border-berry data-checked:bg-berry data-checked:border-berry"
              />
              <Label htmlFor="community-agree" className="text-xs text-foreground font-medium cursor-pointer">
                I understand and agree to follow the community guidelines.
              </Label>
            </div>
          </section>
        </div>

        {/* ═══ RIGHT COLUMN — PAYMENT SUMMARY ═══ */}
        <aside className="w-full shrink-0 xl:w-[380px]">
          <div className="sticky top-20 space-y-5">
            <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-foreground">Payment Summary</h2>

              {/* Wallet Balance */}
              <div className="mt-4 flex items-center justify-between rounded-xl border border-soft-border bg-warm-white p-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-berry/10">
                    <Wallet className="size-4 text-berry" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Wallet Balance</p>
                    <p className="text-sm font-bold text-foreground">₹{availableInRupees.toLocaleString("en-IN")}</p>
                  </div>
                </div>
                <Link href="/wallet" className="text-[10px] font-semibold text-berry hover:text-berry-dark">
                  Add Money →
                </Link>
              </div>

              {/* Price Breakdown */}
              <div className="mt-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Lock className="size-4 text-berry" />
                  Price Breakdown
                </h3>
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      ₹{hourlyRate} × {durationHours} hour{durationHours > 1 ? "s" : ""}
                    </span>
                    <span className="font-medium text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee (10%)</span>
                    <span className="font-medium text-foreground">₹{platformFee.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-soft-border pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-foreground">Total Amount</span>
                      <span className="text-2xl font-bold text-foreground">
                        ₹{totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {!hasSufficientBalance && totalAmount > 0 && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-xs font-semibold text-red-600">
                      ⚠️ Insufficient balance. You need ₹{(totalAmount - availableInRupees).toLocaleString("en-IN")} more.
                    </p>
                    <Link href="/wallet" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-berry hover:text-berry-dark">
                      Add Money to Wallet <ArrowRight className="size-3" />
                    </Link>
                  </div>
                )}

                <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Lock className="size-3" />
                  Amount will be held until companion accepts. Full refund if declined.
                </p>
              </div>

              {/* Terms */}
              <div className="mt-5 flex items-start gap-2.5">
                <Checkbox
                  id="terms-agree"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                  className="mt-0.5 border-berry data-checked:bg-berry data-checked:border-berry"
                />
                <Label
                  htmlFor="terms-agree"
                  className="text-xs text-muted-foreground font-normal cursor-pointer leading-relaxed"
                >
                  I agree to the{" "}
                  <Link href="/terms" className="font-semibold text-berry underline">Terms & Conditions</Link>
                  {" "}and{" "}
                  <Link href="/cancellation" className="font-semibold text-berry underline">Cancellation Policy</Link>
                </Label>
              </div>

              {/* Error */}
              {bookingError && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-semibold text-red-600">{bookingError}</p>
                </div>
              )}

              {/* CTA */}
              <Button
                onClick={handleSubmit}
                disabled={
                  !agreeTerms ||
                  !agreeCommunity ||
                  !scheduledDate ||
                  !scheduledTime ||
                  !hasSufficientBalance ||
                  isSubmitting
                }
                className="mt-5 h-12 w-full rounded-xl bg-deep-plum hover:bg-berry-dark text-white text-sm font-bold shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <Lock className="size-4 mr-1.5" />
                    Send Booking Request <ArrowRight className="size-4 ml-1" />
                  </>
                )}
              </Button>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                Amount is held from your wallet. Deducted only when the meeting completes.
              </p>

              {/* Trust badges */}
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-soft-border pt-4">
                {[
                  { icon: Lock, label: "Secure Payments" },
                  { icon: Headphones, label: "24/7 Support" },
                  { icon: RotateCcw, label: "Easy Refunds" },
                ].map((badge) => (
                  <div key={badge.label} className="flex flex-col items-center gap-1 text-center">
                    <div className="flex size-8 items-center justify-center rounded-full bg-berry/8">
                      <badge.icon className="size-4 text-berry" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {badge.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Checkout page — Dynamic version.
 *
 * URL: /bookings/checkout?companion=<companionProfileId>
 *
 * Flow:
 *   1. User selects date, time, duration
 *   2. System calculates pricing from companion's hourly rate
 *   3. Checks wallet balance
 *   4. On submit → POST /api/bookings → holds funds → notifies companion
 *   5. Redirects to /bookings
 */
export default function BookingsCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center">
          <div className="size-10 animate-spin rounded-full border-4 border-[#f0dfe3] border-t-[#7a1f39]" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
