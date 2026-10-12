import { Suspense } from "react";
import { GuestGuard } from "@/components/auth/guest-guard";

/**
 * AUTH LAYOUT
 *
 * Keep auth screens deliberately minimal with no global app chrome.
 * Wraps in GuestGuard so already logged-in users are redirected to /dashboard.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <GuestGuard>{children}</GuestGuard>
    </Suspense>
  );
}
