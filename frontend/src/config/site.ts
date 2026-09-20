/**
 * Site-wide configuration constants.
 * Single source of truth for brand copy, navigation, and footer content.
 */

export const siteConfig = {
  name: "Companionly",
  tagline: "Real People. Real Connections.",
  description:
    "Log in to your Companionly account and continue your journey of real people, meaningful moments and trusted connections.",
} as const;

/** Main navigation links shown in the navbar. */
export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore Companionship", href: "/explore" },
  { label: "Activities", href: "/activities" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Become a Companion", href: "/become-companion" },
  { label: "Kolkata Experience", href: "/kolkata" },
  { label: "About", href: "/about" },
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
    icon: "star" as const,
    title: "Meaningful Experiences",
    description: "Connect through plans, activities and shared moments.",
  },
  {
    icon: "users" as const,
    title: "Inclusive Community",
    description: "A respectful space for everyone.",
  },
] as const;

/** Trust badge bar shown at bottom of signup hero. */
export const trustBadges = [
  { icon: "check-circle" as const, label: "Verified Profiles" },
  { icon: "heart" as const, label: "Safer Experiences" },
  { icon: "users" as const, label: "Real Connections" },
] as const;

/** Indian cities for the signup city dropdown. */
export const indianCities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Kolkata",
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
      { label: "Companions", href: "/companions" },
      { label: "Activities", href: "/activities" },
      { label: "Events", href: "/events" },
      { label: "Become a companion", href: "/become-companion" },
    ],
  },
  trustAndSafety: {
    title: "Trust & Safety",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Community Guidelines", href: "/community-guidelines" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Partner with us", href: "/partner" },
    ],
  },
  help: {
    title: "Help",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Cancellation & Refund", href: "/refund" },
      { label: "Report an Issue", href: "/report" },
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
