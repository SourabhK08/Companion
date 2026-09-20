import { redirect } from "next/navigation";

/**
 * Root page — redirects to /login.
 *
 * Future behavior: check auth state and redirect to /dashboard
 * if the user is already authenticated. Since we don't have
 * server-side auth checking yet, always redirect to login.
 */
export default function RootPage() {
  redirect("/login");
}
