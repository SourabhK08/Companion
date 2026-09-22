"use client";

import Link from "next/link";
import {
  Check,
  CalendarDays,
  Clock,
  MapPin,
  Star,
  BadgeCheck,
  ShieldCheck,
  Heart,
  ArrowRight,
  ChevronRight,
  MessageSquare,
  Phone,
  CalendarPlus,
  Shirt,
  Smartphone,
  FileText,
  Users,
  Sparkles,
  Handshake,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { currentBooking } from "@/config/bookings-data";

/* ─── Past bookings mock data ─── */

interface PastBooking {
  id: string;
  title: string;
  companion: string;
  date: string;
  time: string;
  venue: string;
  amount: number;
  status: "completed" | "cancelled" | "upcoming";
}

const pastBookings: PastBooking[] = [
  {
    id: "bk-past-001",
    title: "Coffee Experience",
    companion: "Ananya Sharma",
    date: "28 Jun 2025",
    time: "5:30 PM – 7:30 PM",
    venue: "Park Street Cafe, Kolkata",
    amount: 799,
    status: "upcoming",
  },
  {
    id: "bk-past-002",
    title: "Café Hopping",
    companion: "Isha Verma",
    date: "20 Jun 2025",
    time: "3:00 PM – 6:00 PM",
    venue: "College Street, Kolkata",
    amount: 699,
    status: "completed",
  },
  {
    id: "bk-past-003",
    title: "Photography Walk",
    companion: "Tiya Ghosh",
    date: "15 Jun 2025",
    time: "6:00 AM – 9:00 AM",
    venue: "Princep Ghat, Kolkata",
    amount: 899,
    status: "completed",
  },
  {
    id: "bk-past-004",
    title: "Movie Night",
    companion: "Tiya Ghosh",
    date: "10 Jun 2025",
    time: "7:00 PM – 10:00 PM",
    venue: "INOX Forum, Kolkata",
    amount: 1199,
    status: "completed",
  },
  {
    id: "bk-past-005",
    title: "City Tour",
    companion: "Priya Singh",
    date: "05 Jun 2025",
    time: "10:00 AM – 4:00 PM",
    venue: "Various Locations, Kolkata",
    amount: 1499,
    status: "cancelled",
  },
];

const statusConfig = {
  upcoming: { label: "Upcoming", bg: "bg-sky-50", text: "text-sky-600", dot: "bg-sky-500" },
  completed: { label: "Completed", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", bg: "bg-red-50", text: "text-red-500", dot: "bg-red-400" },
};

/**
 * My Bookings page.
 *
 * Shows:
 *   1. Latest confirmed booking (hero banner + details)
 *   2. Booking timeline + important details
 *   3. Past booking history table
 *
 * Backend-ready:
 *   - Confirmed booking: GET /api/bookings/:id
 *   - Past bookings: GET /api/bookings?status=all&page=1
 *   - Checkout flow: /bookings/checkout
 */
export default function BookingsPage() {
  const booking = currentBooking;
  const platformFee = 0; // Promo applied
  const totalPaid = booking.basePrice + platformFee;

  return (
    <div className="flex flex-col">
      {/* ═══ BOOKING CONFIRMED HERO ═══ */}
      <section className="relative overflow-hidden bg-deep-plum">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 35% 50%, rgba(245,182,201,0.12), transparent 50%), radial-gradient(circle at 75% 30%, rgba(255,255,255,0.06), transparent 40%), linear-gradient(135deg, var(--color-deep-plum) 0%, var(--color-berry-dark) 40%, var(--color-berry) 75%, var(--color-dusty-rose) 100%)",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-plum/95 via-deep-plum/70 to-transparent" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex max-w-[1400px] items-center justify-between px-6 py-10 lg:px-8 lg:py-14">
          <div className="max-w-lg">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
                <Check className="size-5 text-white" strokeWidth={3} />
              </div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Booking Confirmed!
              </h1>
            </div>
            <p className="mt-3 text-base font-medium text-white/80">
              Your experience has been successfully booked.
            </p>
            <p className="mt-1 text-sm text-white/55 leading-relaxed">
              We&apos;re excited for you to meet {booking.companion.name}. Get
              ready for a memorable {booking.experienceTitle.toLowerCase()} in{" "}
              {booking.city}!
            </p>
            <Link
              href="#details"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              View Booking Details <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="hidden lg:flex flex-col items-end gap-3 text-right">
            <p className="font-serif text-xl italic text-white/12 leading-tight xl:text-2xl">
              Good Vibes
              <br />
              Great Company
              <br />
              Better Days ♡
            </p>
            <p className="font-serif text-sm italic text-dusty-rose/25 leading-tight">
              Friends
              <br />
              Make Life Brighter ♡
            </p>
          </div>
        </div>
      </section>

      {/* ═══ 3-COLUMN INFO ROW ═══ */}
      <section id="details" className="mx-auto w-full max-w-[1400px] px-6 py-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Companion Info */}
          <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-dusty-rose to-berry" />
                <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8px] font-bold text-white">
                  <BadgeCheck className="size-2.5" /> Verified
                </span>
                <button className="absolute bottom-1.5 left-1.5 flex size-6 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                  <Heart className="size-3" fill="currentColor" />
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-foreground">{booking.companion.name}</h3>
                  <BadgeCheck className="size-4 text-sky-500" />
                </div>
                <p className="text-xs text-muted-foreground">{booking.companion.age} years · {booking.companion.city}</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    <Star className="size-3 text-amber-500" fill="currentColor" />
                    <span className="text-xs font-semibold">{booking.companion.rating}</span>
                    <span className="text-[10px] text-muted-foreground">({booking.companion.reviews} reviews)</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">· 98% Response Rate</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {booking.tags.map((tag) => (
                <span key={tag} className="rounded-md border border-soft-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{tag}</span>
              ))}
              <span className="rounded-md border border-soft-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">+2 more</span>
            </div>
            <p className="mt-2.5 text-[11px] italic text-muted-foreground leading-relaxed">
              &ldquo;Love exploring new places, trying different cuisines and capturing beautiful moments.&rdquo;
            </p>
          </div>

          {/* Experience Details */}
          <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">{booking.experienceTitle}</h3>
                <p className="text-xs text-muted-foreground">With {booking.companion.name}</p>
              </div>
              <span className="rounded-full bg-berry/10 px-2.5 py-1 text-[10px] font-bold text-berry">
                {booking.duration} Session
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2.5 text-sm">
                <CalendarDays className="size-4 shrink-0 text-berry" />
                <span className="text-foreground">{booking.date}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Clock className="size-4 shrink-0 text-berry" />
                <span className="text-foreground">{booking.time}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <MapPin className="size-4 shrink-0 text-berry" />
                <span className="text-foreground">{booking.venue}, {booking.city}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
                <span className="text-muted-foreground">You&apos;ll be meeting in a public place</span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-foreground">Payment Summary</h3>
            <div className="mt-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{booking.experienceTitle}</span>
                <span className="font-medium">₹{booking.basePrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="font-medium">₹{platformFee}</span>
              </div>
              <div className="border-t border-soft-border pt-2">
                <div className="flex justify-between">
                  <span className="text-base font-bold">Total Paid</span>
                  <span className="text-xl font-bold text-foreground">₹{totalPaid}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <div className="flex size-5 items-center justify-center rounded-full bg-emerald-100">
                <Check className="size-3 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-emerald-600">Payment Successful</span>
            </div>
            <Button variant="outline" className="mt-3 h-9 w-full rounded-xl border-soft-border text-xs font-semibold">
              <FileText className="size-3.5 mr-1.5" />
              View Invoice
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ TIMELINE + DETAILS + SIDEBAR ═══ */}
      <section className="mx-auto w-full max-w-[1400px] px-6 pb-6 lg:px-8">
        <div className="flex flex-col gap-5 xl:flex-row">
          {/* Booking Timeline */}
          <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm sm:p-6 flex-1">
            <h3 className="text-lg font-bold text-foreground">Booking Timeline</h3>
            <div className="mt-4 space-y-0">
              {[
                { label: "Booking Confirmed", sub: `Your session is confirmed with ${booking.companion.name}.`, time: "Today, 10:24 AM", done: true },
                { label: "Payment Successful", sub: `₹${totalPaid} paid via UPI`, time: "Today, 10:26 AM", done: true },
                { label: "Companion Notified", sub: `${booking.companion.name} has been informed about your booking.`, time: "Today, 10:27 AM", done: true },
                { label: "Get Ready!", sub: "We'll send you a reminder before the session.", time: "On 28 Jun, 4:30 PM", done: true },
              ].map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500">
                      <Check className="size-3.5 text-white" />
                    </div>
                    {i < 3 && <div className="w-px flex-1 bg-emerald-200 my-1" />}
                  </div>
                  <div className="flex-1 pb-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{step.label}</p>
                      <span className="text-[10px] text-muted-foreground">{step.time}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Details */}
          <div className="flex-1 space-y-5">
            <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-lg font-bold text-foreground">Important Details</h3>
              <div className="mt-4 space-y-3.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-berry" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Meeting Point</p>
                      <p className="text-xs text-muted-foreground">{booking.venue}, {booking.city}</p>
                    </div>
                  </div>
                  <Link href="#" className="text-[10px] font-semibold text-berry hover:text-berry-dark flex items-center gap-0.5">View Map <ArrowRight className="size-2.5" /></Link>
                </div>
                <div className="flex items-start gap-2.5">
                  <Shirt className="mt-0.5 size-4 shrink-0 text-berry" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Dress Code</p>
                    <p className="text-xs text-muted-foreground">Smart Casual</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Smartphone className="mt-0.5 size-4 shrink-0 text-berry" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">What to Bring</p>
                    <p className="text-xs text-muted-foreground">Your phone, ID (optional), and good vibes!</p>
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <FileText className="mt-0.5 size-4 shrink-0 text-berry" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Cancellation Policy</p>
                      <p className="text-xs text-muted-foreground">Free cancellation up to 24 hours before.</p>
                    </div>
                  </div>
                  <Link href="/terms" className="text-[10px] font-semibold text-berry hover:text-berry-dark flex items-center gap-0.5">View Policy <ArrowRight className="size-2.5" /></Link>
                </div>
              </div>
            </div>

            {/* Safety */}
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <ShieldCheck className="size-5 shrink-0 text-emerald-600" />
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">Your Safety Matters</p>
                <p className="text-[11px] text-muted-foreground">All companions are government ID verified. We ensure safe, respectful and real experiences.</p>
              </div>
              <Link href="/safety" className="inline-flex h-8 items-center gap-1 rounded-full border border-emerald-300 bg-white px-3 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-50">Learn More <ArrowRight className="size-2.5" /></Link>
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="w-full shrink-0 xl:w-[260px] space-y-5">
            {/* Need Help */}
            <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                <MessageSquare className="size-4 text-berry" />
                Need Help?
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">Our support team is available 24/7 to assist you.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button className="h-9 rounded-xl bg-berry hover:bg-berry-dark text-white text-[11px] font-semibold gap-1">
                  <MessageSquare className="size-3" /> Chat with Support
                </Button>
                <Button variant="outline" className="h-9 rounded-xl border-soft-border text-[11px] font-semibold gap-1">
                  <Phone className="size-3" /> Call Us
                </Button>
              </div>
            </div>

            {/* Add to Calendar */}
            <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                <CalendarPlus className="size-4 text-berry" />
                Add to Calendar
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">Don&apos;t miss your experience!</p>
              <Button variant="outline" className="mt-3 h-9 w-full rounded-xl border-soft-border text-xs font-semibold gap-1.5">
                <CalendarPlus className="size-3.5" /> Add to Calendar
              </Button>
            </div>
          </aside>
        </div>
      </section>

      {/* ═══ MORE TO EXPLORE ═══ */}
      <section className="mx-auto w-full max-w-[1400px] px-6 pb-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">More to Explore</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">People, experiences and stories waiting for you</p>
          </div>
          <p className="hidden md:block font-serif text-sm italic text-berry/15 leading-tight text-right">
            Different People
            <br />
            Same Dreams ♡
          </p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Users, title: "Find New Friends", sub: "Explore Buddies", href: "/explore", color: "from-berry-dark to-berry" },
            { icon: Heart, title: "Go on a Date", sub: "Meet Dating Companions", href: "/explore/male", color: "from-berry to-dusty-rose" },
            { icon: Sparkles, title: "Attend Offline Events", sub: "Discover Events", href: "/events", color: "from-deep-plum to-berry-dark" },
            { icon: Handshake, title: "Find a Cofounder", sub: "Build Together", href: "/explore/cofounder", color: "from-berry-dark to-deep-plum" },
          ].map((card) => (
            <Link key={card.href} href={card.href} className="group overflow-hidden rounded-2xl">
              <div className={cn("relative h-28 bg-gradient-to-br", card.color)}>
                <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/5" />
                <card.icon className="absolute right-3 top-3 size-5 text-white/20" />
              </div>
              <div className="border border-t-0 border-soft-border bg-white p-3 rounded-b-2xl">
                <p className="text-sm font-bold text-foreground">{card.title}</p>
                <p className="flex items-center gap-0.5 text-[10px] font-medium text-berry">
                  {card.sub} <ArrowRight className="size-2.5" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ PAST BOOKING HISTORY ═══ */}
      <section className="mx-auto w-full max-w-[1400px] px-6 pb-8 lg:px-8">
        <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <CalendarDays className="size-5 text-berry" />
              Booking History
            </h2>
            <Link href="#" className="flex items-center gap-0.5 text-xs font-semibold text-berry hover:text-berry-dark">
              View All <ArrowRight className="size-3" />
            </Link>
          </div>

          {/* Table Header */}
          <div className="mt-4 hidden border-b border-soft-border pb-2 sm:grid sm:grid-cols-[1fr_140px_140px_140px_90px_90px_32px] sm:gap-3">
            {["Experience", "Companion", "Date", "Venue", "Amount", "Status", ""].map((h) => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="mt-2 divide-y divide-soft-border">
            {pastBookings.map((bk) => {
              const cfg = statusConfig[bk.status];
              return (
                <div key={bk.id} className="grid grid-cols-1 gap-2 py-3.5 sm:grid-cols-[1fr_140px_140px_140px_90px_90px_32px] sm:items-center sm:gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{bk.title}</p>
                    <p className="text-[10px] text-muted-foreground sm:hidden">{bk.companion} · {bk.date}</p>
                  </div>
                  <span className="hidden text-xs text-muted-foreground sm:block">{bk.companion}</span>
                  <span className="hidden text-xs text-muted-foreground sm:block">{bk.date}</span>
                  <span className="hidden text-xs text-muted-foreground sm:block truncate">{bk.venue}</span>
                  <span className="text-sm font-bold text-foreground">₹{bk.amount}</span>
                  <span className={cn("inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", cfg.bg, cfg.text)}>
                    <span className={cn("size-1.5 rounded-full", cfg.dot)} />
                    {cfg.label}
                  </span>
                  <ChevronRight className="hidden size-4 text-muted-foreground/30 sm:block" />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
