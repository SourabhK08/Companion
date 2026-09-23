import React from "react";
import { Bell, CalendarCheck, ShieldCheck, Tag, Megaphone } from "lucide-react";

const items = [
  { id: 'n-1', title: 'New Message', body: 'Priya Singh sent you a message: "Hey! Are you available this weekend?"', time: '10:24 AM', type: 'message' },
  { id: 'n-2', title: 'Booking Confirmed', body: 'Your booking with Riya Verma for 28 Jun 2025, 04:30 PM is confirmed.', time: '09:15 AM', type: 'booking' },
  { id: 'n-3', title: 'Account Verified', body: 'Your identity has been successfully verified.', time: 'Yesterday', type: 'update' },
  { id: 'n-4', title: 'Payment Successful', body: '₹1,000 has been added to your wallet. (UPI)', time: '2 days ago', type: 'update' },
  { id: 'n-5', title: 'Special Offer Just for You!', body: 'Get 20% off on your next booking. Use code MODHURALAP20.', time: '2 days ago', type: 'promo' },
];

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-[#f7efee] p-4 lg:p-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-[22px] border border-[#ebd5d9] bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-[26px] font-bold text-[#4d0d1d]">Notifications</h1>
              <p className="text-[13px] text-[#6f4d54]">Stay updated with your bookings, messages, and important activities.</p>
            </div>
            <div>
              <button className="rounded-full border border-[#ebd5d9] bg-[#f9ebee] px-3 py-2 text-sm font-semibold text-[#7a1f39]">Mark all as read</button>
            </div>
          </div>

          <div className="mt-4 border-b border-[#f1dfe4] pb-3">
            <nav className="flex gap-3 text-[13px]">
              <button className="rounded-full bg-[#7a1f39] px-3 py-1 text-white">All</button>
              <button className="px-3 py-1 text-[#6f4d54]">Messages <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#fdeef0] text-[12px]">2</span></button>
              <button className="px-3 py-1 text-[#6f4d54]">Bookings <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#fdeef0] text-[12px]">3</span></button>
              <button className="px-3 py-1 text-[#6f4d54]">Updates <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#fdeef0] text-[12px]">2</span></button>
              <button className="px-3 py-1 text-[#6f4d54]">Promotions <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#fdeef0] text-[12px]">1</span></button>
            </nav>
          </div>

          <div className="mt-4 grid gap-3">
            {items.map((it) => (
              <div key={it.id} className="flex items-start gap-3 rounded-[12px] border border-[#f1dfe4] p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fdeff1] text-[#7a1f39]">
                  {it.type === 'message' ? <Bell className="h-5 w-5" /> : it.type === 'booking' ? <CalendarCheck className="h-5 w-5" /> : it.type === 'update' ? <ShieldCheck className="h-5 w-5" /> : <Megaphone className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-[15px] font-semibold text-[#3d2a32]">{it.title}</div>
                    <div className="text-xs text-[#9b7d83]">{it.time}</div>
                  </div>
                  <div className="mt-1 text-[13px] text-[#6f4d54]">{it.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
