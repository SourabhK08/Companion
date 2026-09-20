/**
 * Site-wide configuration constants.
 * Single source of truth for brand copy, navigation, and footer content.
 *
 * Brand: Modhuralap — "Real People. Real Conversations."
 */

export const siteConfig = {
  name: "Modhuralap",
  tagline: "Real People. Real Conversations.",
  description:
    "Meet like-minded people, share conversations, find your companions and create beautiful moments — in real life.",
  loginDescription:
    "Log in to your Modhuralap account and continue your journey of real people, meaningful moments and trusted connections.",
} as const;

/** Main navigation links shown in the navbar. */
export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore Companionship", href: "/explore" },
  { label: "Activities", href: "/activities" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Kolkata Experience", href: "/kolkata" },
  { label: "About", href: "/about" },
] as const;

/** Sidebar navigation items for the dashboard. */
/**
 * Sidebar navigation — two groups separated by a divider.
 *
 * Group 1: Explore section (top)
 * Group 2: User actions (bottom)
 */
export const sidebarExploreLinks = [
  {
    label: "Explore Upcoming Offline Events",
    href: "/events",
    icon: "calendar-search" as const,
  },
  {
    label: "Explore Buddies",
    href: "/explore",
    icon: "users-round" as const,
  },
  {
    label: "Explore Male Dating Companions",
    href: "/explore/male",
    icon: "male" as const,
  },
  {
    label: "Explore Female Dating Companions",
    href: "/explore/female",
    icon: "female" as const,
  },
  {
    label: "Explore Queer Friendly Dating Companions",
    href: "/explore/queer",
    icon: "heart-handshake" as const,
  },
  {
    label: "Explore Ideal Cofounder / Co Partner",
    href: "/explore/cofounder",
    icon: "users-cog" as const,
  },
] as const;

export const sidebarUserLinks = [
  { label: "My Bookings", href: "/bookings", icon: "calendar-check" as const },
  { label: "Messages", href: "/messages", icon: "message-circle" as const, badge: 2 },
  { label: "Saved Companions", href: "/saved", icon: "heart" as const },
  { label: "Reviews", href: "/reviews", icon: "star" as const },
  { label: "Wallets", href: "/wallet", icon: "wallet" as const },
  { label: "Trust & Safety", href: "/safety", icon: "shield" as const },
  { label: "My Profile", href: "/profile", icon: "user" as const },
  { label: "Settings", href: "/settings", icon: "settings" as const },
  { label: "Terms & Condition", href: "/terms", icon: "file-text" as const },
  { label: "Become a Partner", href: "/become-partner", icon: "handshake" as const },
  { label: "About Us", href: "/about", icon: "info" as const },
] as const;

/** Trust indicators displayed on the login hero. */
export const trustIndicators = [
  {
    icon: "shield-check" as const,
    title: "100% Verified",
    description: "Real people. Real profiles.",
  },
  {
    icon: "lock" as const,
    title: "Safe & Secure",
    description: "Your safety is our priority.",
  },
  {
    icon: "users" as const,
    title: "Trusted by 50,000+",
    description: "Happy members and counting.",
  },
] as const;

/** Trust indicators displayed on the signup hero (2×2 grid). */
export const signupTrustIndicators = [
  {
    icon: "users" as const,
    title: "Real People",
    description: "Genuine profiles, real conversations.",
  },
  {
    icon: "lock" as const,
    title: "Safe & Secure",
    description: "Your privacy is our priority.",
  },
  {
    icon: "star" as const,
    title: "Meaningful Experiences",
    description: "From coffee meets to city explorations.",
  },
  {
    icon: "heart" as const,
    title: "Supportive Community",
    description: "A respectful space for everyone.",
  },
] as const;

/** Trust badge bar shown at bottom of signup hero. */
export const trustBadges = [
  { icon: "check-circle" as const, label: "Verified Profiles" },
  { icon: "heart" as const, label: "Safer Experiences" },
  { icon: "users" as const, label: "Meaningful Bonds" },
  { icon: "map-pin" as const, label: "Real Life Meetups" },
] as const;

/** Indian cities for the signup city dropdown. */
export const indianCities = [
  "Kolkata",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Chandigarh",
  "Goa",
  "Kochi",
  "Indore",
  "Bhopal",
  "Nagpur",
  "Surat",
  "Vadodara",
  "Coimbatore",
  "Visakhapatnam",
] as const;

/** Footer navigation groups. */
export const footerLinks = {
  explore: {
    title: "Explore",
    links: [
      { label: "Companionship", href: "/explore" },
      { label: "Activities", href: "/activities" },
      { label: "Kolkata Experience", href: "/kolkata" },
      { label: "Events", href: "/events" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "Community Guidelines", href: "/community-guidelines" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
    ],
  },
  help: {
    title: "Help",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Report an Issue", href: "/report" },
      { label: "Safety Tips", href: "/safety-tips" },
      { label: "Help & Support", href: "/support" },
    ],
  },
} as const;

/** Social media link placeholders. */
export const socialLinks = [
  { label: "Instagram", href: "#", icon: "instagram" },
  { label: "X (Twitter)", href: "#", icon: "twitter" },
  { label: "Facebook", href: "#", icon: "facebook" },
  { label: "YouTube", href: "#", icon: "youtube" },
  { label: "LinkedIn", href: "#", icon: "linkedin" },
] as const;
