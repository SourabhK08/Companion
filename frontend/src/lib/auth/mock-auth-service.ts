/**
 * ⚠️  DEV ONLY — Mock Authentication Service
 *
 * This implementation exists solely to demonstrate the login/logout UI flow
 * during frontend development. It does NOT provide real security.
 *
 * Behavior:
 *   - Accepts any valid email with password "password123"
 *   - Simulates 800ms network latency
 *   - Stores auth state in memory (lost on page refresh)
 *   - Logs a warning to the console on every call
 *
 * Replace with a real ApiAuthService before production deployment.
 */

import type { AuthService, AuthResult, AuthUser, LoginCredentials } from "./types";

const DEV_PASSWORD = "password123";
const SIMULATED_DELAY_MS = 800;

/** Simulate network latency. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockAuthService implements AuthService {
  private currentUser: AuthUser | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      console.warn(
        "⚠️  DEV ONLY: MockAuthService is active. " +
          "This provides NO real security. " +
          "Replace with ApiAuthService before production deployment."
      );
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    console.warn("⚠️  DEV ONLY: MockAuthService.login() called");

    await delay(SIMULATED_DELAY_MS);

    if (!credentials.email || !credentials.password) {
      return { success: false, error: "Email and password are required." };
    }

    if (credentials.password !== DEV_PASSWORD) {
      return { success: false, error: "Invalid email or password." };
    }

    const user: AuthUser = {
      id: "dev-user-001",
      email: credentials.email,
      name: credentials.email.split("@")[0],
    };

    this.currentUser = user;

    return { success: true, user };
  }

  async logout(): Promise<void> {
    console.warn("⚠️  DEV ONLY: MockAuthService.logout() called");
    await delay(300);
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    console.warn("⚠️  DEV ONLY: MockAuthService.getCurrentUser() called");
    await delay(200);
    return this.currentUser;
  }
}
