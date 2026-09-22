"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  CalendarDays,
  Clock,
  MapPin,
  Star,
  BadgeCheck,
  ShieldCheck,
  Heart,
  Lock,
  ArrowRight,
  CreditCard,
  Landmark,
  Wallet,
  Smartphone,
  Users,
  Headphones,
  RotateCcw,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  currentBooking,
  paymentMethods,
  verificationBadges,
} from "@/config/bookings-data";

/* ─── Payment Method Icons ─── */

const paymentIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  upi: Smartphone,
  card: CreditCard,
  wallet: Wallet,
  bank: Landmark,
};

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

/**
 * My Bookings / Checkout page.
 *
 * Backend-ready architecture:
 *   - Booking data from mock file (swap with GET /api/bookings/:id)
 *   - Payment method selection state (ready for payment gateway integration)
 *   - Promo code input (ready for POST /api/promo/validate)
 *   - Complete Booking CTA (ready for POST /api/bookings/:id/pay)
 */
export default function BookingsCheckoutPage() {
  const router = useRouter();
  const booking = currentBooking;
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [promoCode, setPromoCode] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreeCommunity, setAgreeCommunity] = useState(true);

  const platformFee = Math.round(
    booking.basePrice * (booking.platformFeePercent / 100)
  );
  const totalAmount = booking.basePrice + platformFee;

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      {/* ═══ PROGRESS STEPPER ═══ */}
      <div className="flex items-center justify-between sm:justify-start sm:gap-0">
        <ProgressStep step={1} label="Booking Details" isActive={false} isCompleted={booking.step > 1} />
        <div className="mx-2 hidden h-px w-16 bg-soft-border sm:block lg:w-24" aria-hidden="true" />
        <ProgressStep step={2} label="Payment" isActive={booking.step === 2} isCompleted={booking.step > 2} />
        <div className="mx-2 hidden h-px w-16 bg-soft-border sm:block lg:w-24" aria-hidden="true" />
        <ProgressStep step={3} label="Confirmation" isActive={booking.step === 3} isCompleted={false} />

        {/* Decorative script */}
        <p className="ml-auto hidden font-serif text-base italic text-berry/15 leading-tight lg:block">
          Good Vibes
          <br />
          Great Company
          <br />
          Better Days ♡
        </p>
      </div>

      {/* ═══ HEADING ═══ */}
      <div className="mt-6">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Complete Your Booking
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Secure your experience with a safe and seamless payment process.
        </p>
      </div>

      {/* ═══ MAIN 2-COLUMN LAYOUT ═══ */}
      <div className="mt-6 flex flex-col gap-6 xl:flex-row">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* ─── Booking Summary ─── */}
          <section className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Booking Summary</h2>
              <button className="text-xs font-semibold text-berry hover:text-berry-dark">
                Edit
              </button>
            </div>

            {/* Experience card */}
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              {/* Image placeholder */}
              <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl sm:h-auto sm:w-52">
                <div className="absolute inset-0 bg-gradient-to-br from-berry-dark/70 via-berry/50 to-dusty-rose/30" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                  <button className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                    <Heart className="size-3.5" fill="currentColor" />
                  </button>
                </div>
                {/* Decorative script on image */}
                <p className="absolute right-2 top-2 font-serif text-[10px] italic text-white/30 leading-tight text-right">
                  Good Conversations
                  <br />
                  Better People ♡
                </p>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <h3 className="text-xl font-bold text-foreground">
                    {booking.experienceTitle}
                  </h3>
                  {booking.companion.isVerified && (
                    <span className="mt-0.5 flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <BadgeCheck className="size-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  With {booking.companion.name}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  <Star className="size-3.5 text-amber-500" fill="currentColor" />
                  <span className="text-sm font-semibold text-foreground">
                    {booking.companion.rating}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({booking.companion.reviews} reviews)
                  </span>
                </div>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {booking.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-soft-border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="rounded-md border border-soft-border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    +2 more
                  </span>
                </div>

                <p className="mt-3 text-sm italic text-muted-foreground leading-relaxed">
                  &ldquo;{booking.description}&rdquo;
                </p>
              </div>
            </div>

            {/* Date / Time / Location row */}
            <div className="mt-5 grid grid-cols-3 gap-4 rounded-xl border border-soft-border bg-warm-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-berry/10">
                  <CalendarDays className="size-4 text-berry" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground">Date</p>
                  <p className="text-sm font-semibold text-foreground">{booking.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-berry/10">
                  <Clock className="size-4 text-berry" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground">Time</p>
                  <p className="text-sm font-semibold text-foreground">{booking.time}</p>
                  <p className="text-[10px] text-muted-foreground">({booking.duration})</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-berry/10">
                  <MapPin className="size-4 text-berry" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground">Location</p>
                  <p className="text-sm font-semibold text-foreground">
                    {booking.venue},<br />{booking.city}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Companion Details ─── */}
          <section className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Users className="size-5 text-berry" />
              Companion Details
            </h2>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar placeholder */}
                <div className="size-14 shrink-0 rounded-full bg-gradient-to-br from-dusty-rose to-berry" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-foreground">
                      {booking.companion.name}
                    </h3>
                    {booking.companion.isVerified && (
                      <BadgeCheck className="size-4 text-sky-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {booking.companion.age} years · {booking.companion.city}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="size-3.5 text-amber-500" fill="currentColor" />
                <span className="text-sm font-semibold">{booking.companion.rating}</span>
                <span className="text-xs text-muted-foreground">
                  ({booking.companion.reviews} reviews)
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {booking.companion.languages.map((lang) => (
                  <span
                    key={lang}
                    className="rounded-md border border-soft-border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    {lang}
                  </span>
                ))}
              </div>
              <Link
                href={`/companion/${booking.companion.id}`}
                className="inline-flex h-9 items-center rounded-xl border border-soft-border px-4 text-xs font-semibold text-muted-foreground transition-colors hover:border-berry hover:text-berry"
              >
                View Profile
              </Link>
            </div>
          </section>

          {/* ─── About Verified Account ─── */}
          <section className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <Check className="size-4 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  About Verified Account
                </h2>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  All companions on Modhuralap go through a strict verification
                  process to ensure a safe, authentic and trustworthy experience.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* Verification badges */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {verificationBadges.map((badge) => (
                  <div key={badge.label} className="flex flex-col items-center gap-1 text-center">
                    <div className="flex size-8 items-center justify-center rounded-full bg-berry/8">
                      <ShieldCheck className="size-4 text-berry" />
                    </div>
                    <p className="text-[10px] font-semibold text-foreground">{badge.label}</p>
                    <p className="text-[9px] text-muted-foreground leading-tight">{badge.description}</p>
                  </div>
                ))}
              </div>

              {/* Verified companion badge */}
              <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100">
                  <ShieldCheck className="size-5 text-emerald-600" />
                </div>
                <p className="text-xs font-bold text-emerald-700">Verified Companion</p>
                <p className="text-[10px] text-emerald-600/80 leading-tight">
                  Look for the green verified badge for a safer experience.
                </p>
                <Link
                  href="/safety"
                  className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 hover:underline"
                >
                  Learn More <ArrowRight className="size-2.5" />
                </Link>
              </div>
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
                <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                  Modhuralap promotes safe, respectful and meaningful experiences.
                  Any form of harassment, abuse or inappropriate behavior may
                  result in immediate suspension of your account.
                </p>
              </div>
              <p className="hidden md:block font-serif text-xs italic text-berry/20 leading-tight text-right shrink-0">
                Respect Creates
                <br />
                Better Connections ♡
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2.5">
              <Checkbox
                id="community-agree"
                checked={agreeCommunity}
                onCheckedChange={(checked) => setAgreeCommunity(checked === true)}
                className="border-berry data-checked:bg-berry data-checked:border-berry"
              />
              <Label
                htmlFor="community-agree"
                className="text-xs text-foreground font-medium cursor-pointer"
              >
                I understand and agree to follow the community guidelines.
              </Label>
            </div>
            <Link
              href="/community-guidelines"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-berry hover:text-berry-dark"
            >
              Read Community Guidelines <ArrowRight className="size-3" />
            </Link>
          </section>
        </div>

        {/* ═══ RIGHT COLUMN — PAYMENT DETAILS ═══ */}
        <aside className="w-full shrink-0 xl:w-[380px]">
          <div className="sticky top-20 space-y-5">
            <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-foreground">Payment Details</h2>

              {/* Select Payment Method */}
              <div className="mt-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Lock className="size-4 text-berry" />
                  Select Payment Method
                </h3>
                <div className="mt-3 space-y-2">
                  {paymentMethods.map((method) => {
                    const Icon = paymentIconMap[method.icon];
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                          selectedPayment === method.id
                            ? "border-berry bg-berry/5 ring-1 ring-berry/20"
                            : "border-soft-border bg-white hover:border-berry/30"
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-5 items-center justify-center rounded-full border-2",
                            selectedPayment === method.id
                              ? "border-berry bg-berry"
                              : "border-soft-border"
                          )}
                        >
                          {selectedPayment === method.id && (
                            <div className="size-2 rounded-full bg-white" />
                          )}
                        </div>
                        {Icon && (
                          <Icon
                            className={cn(
                              "size-4",
                              selectedPayment === method.id
                                ? "text-berry"
                                : "text-muted-foreground"
                            )}
                          />
                        )}
                        <span className="flex-1 text-sm font-medium text-foreground">
                          {method.label}
                        </span>
                        {method.recommended && (
                          <span className="rounded-full bg-berry/10 px-2 py-0.5 text-[9px] font-bold text-berry">
                            Recommended
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Apply Promo Code
                </h3>
                <div className="mt-2 flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="h-9 flex-1 rounded-lg border-soft-border text-sm"
                  />
                  <Button
                    variant="outline"
                    className="h-9 rounded-lg border-soft-border px-4 text-xs font-semibold"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mt-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Lock className="size-4 text-berry" />
                  Price Breakdown
                </h3>
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{booking.experienceTitle}</span>
                    <span className="font-medium text-foreground">
                      ₹{booking.basePrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Platform Fee ({booking.platformFeePercent}%)
                    </span>
                    <span className="font-medium text-foreground">
                      ₹{platformFee.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="border-t border-soft-border pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-foreground">
                        Total Amount
                      </span>
                      <span className="text-2xl font-bold text-foreground">
                        ₹{totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600">
                  <Check className="size-3" />
                  No additional charges. What you see is what you pay.
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
                  <Link href="/terms" className="font-semibold text-berry underline">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/cancellation" className="font-semibold text-berry underline">
                    Cancellation Policy
                  </Link>
                </Label>
              </div>

              {/* CTA */}
              <Button
                onClick={() => router.push("/bookings")}
                disabled={!agreeTerms || !agreeCommunity}
                className="mt-5 h-12 w-full rounded-xl bg-deep-plum hover:bg-berry-dark text-white text-sm font-bold shadow-lg disabled:opacity-50"
              >
                <Lock className="size-4 mr-1.5" />
                Complete Booking <ArrowRight className="size-4 ml-1" />
              </Button>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                Your payment information is encrypted and secure.
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
