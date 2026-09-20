/**
 * AUTH LAYOUT
 *
 * Keep auth screens deliberately minimal with no global app chrome.
 * The page itself owns the brand area and layout so each auth screen
 * can match its intended mockup without duplicated header/logo blocks.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
