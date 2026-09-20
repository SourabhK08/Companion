/**
 * AUTH LAYOUT
 *
 * A clean auth-only shell keeps the login flow focused and conversion-friendly.
 * The top-left logo space is intentionally kept as a placeholder so it can be
 * swapped for the real asset later without changing the layout structure.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden bg-deep-plum">
      <div className="mx-auto flex h-full max-w-[1700px] flex-col">
        <header className="relative z-30 shrink-0 px-4 pt-5 sm:px-6 lg:px-8 lg:pt-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/40 bg-white/10 shadow-[0_8px_25px_rgba(20,8,22,0.18)] backdrop-blur-sm">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-dusty-rose via-white/80 to-berry-dark" />
            </div>

            <div className="flex flex-col leading-none text-white/90">
              <span className="text-lg font-semibold tracking-tight">Brand Logo</span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/60">
                Placeholder
              </span>
            </div>
          </div>
        </header>

        <main className="relative flex min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
