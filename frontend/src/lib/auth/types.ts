/**
 * Core authentication types.
 *
 * These types form the contract between:
 *   - The UI (login form, auth guards, etc.)
 *   - The auth provider (React context)
 *   - The auth service implementation (mock today, real API later)
 *
 * Adding a new auth method (Google, Microsoft, OTP) means:
 *   1. Add a new method to AuthService
 *   2. Implement it in the service
 *   3. Wire it to the UI
 * No existing code needs to change.
 */

/** Authenticated user representation. */
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

/** Login credentials for email/password authentication. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Result of an authentication attempt. */
export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

/** Client-side authentication state. */
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Authentication service interface.
 *
 * Implementations:
 *   - MockAuthService  (development only — today)
 *   - ApiAuthService   (future — real backend calls)
 *
 * Future methods to add:
 *   - loginWithGoogle(): Promise<AuthResult>
 *   - loginWithMicrosoft(): Promise<AuthResult>
 *   - loginWithOtp(email: string, otp: string): Promise<AuthResult>
 *   - register(data: RegistrationData): Promise<AuthResult>
 *   - resetPassword(email: string): Promise<void>
 */
export interface AuthService {
  /** Authenticate with email and password. */
  login(credentials: LoginCredentials): Promise<AuthResult>;

  /** End the current session. */
  logout(): Promise<void>;

  /** Retrieve the currently authenticated user, if any. */
  getCurrentUser(): Promise<AuthUser | null>;
}
