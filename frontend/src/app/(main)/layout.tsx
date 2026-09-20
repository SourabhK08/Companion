import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/**
 * Main layout for authenticated routes (/dashboard, /profile, etc.)
 *
 * Future: Add auth guard middleware or client-side redirect
 * to ensure only authenticated users can access these routes.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
