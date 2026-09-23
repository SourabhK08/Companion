/**
 * Mock data for the Settings page.
 *
 * ⚠️  DEV ONLY — Replace with real API calls when backend is ready.
 * Matches: GET /api/users/me/settings and PATCH /api/users/me
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  location: string;
  avatar: string | null;
  isVerified: boolean;
}

export interface QuickSettings {
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  emailNotifications: boolean;
  activityVisibility: boolean;
}

export const initialUserProfile: UserProfile = {
  id: "usr-001",
  name: "Rahul Sharma",
  email: "rahulsharma@gmail.com",
  phone: "+91 98765 43210",
  gender: "Male",
  dateOfBirth: "28 Jun 1997",
  location: "Kolkata, West Bengal",
  avatar: null,
  isVerified: true,
};

export const initialQuickSettings: QuickSettings = {
  twoFactorAuth: true,
  loginAlerts: true,
  emailNotifications: true,
  activityVisibility: false,
};

export const settingsNavLinks = [
  { id: "account", label: "Account Settings", icon: "user" as const },
  { id: "privacy", label: "Privacy & Security", icon: "lock" as const },
  { id: "notifications", label: "Notifications", icon: "bell" as const },
  { id: "payment", label: "Payment Methods", icon: "credit-card" as const },
  { id: "language", label: "Language & Region", icon: "globe" as const },
  { id: "appearance", label: "Appearance", icon: "palette" as const },
  { id: "support", label: "Help & Support", icon: "help-circle" as const },
  { id: "about", label: "About Us", icon: "info" as const },
] as const;
