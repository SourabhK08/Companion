"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AuthService,
  AuthState,
  AuthUser,
  LoginCredentials,
  AuthResult,
} from "./types";

/** Shape of the auth context value. */
interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  /** The auth service implementation to use (mock for dev, real for prod). */
  authService: AuthService;
}

/**
 * AuthProvider manages authentication state and exposes login/logout.
 *
 * It accepts an AuthService implementation, keeping the provider
 * decoupled from any specific auth mechanism.
 */
export function AuthProvider({ children, authService }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  // On mount, attempt to restore existing session.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const existingUser = await authService.getCurrentUser();
        if (!cancelled) {
          setUser(existingUser);
        }
      } catch {
        // No session to restore — that's fine.
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [authService]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResult> => {
      setIsLoading(true);
      try {
        const result = await authService.login(credentials);
        if (result.success && result.user) {
          setUser(result.user);
        }
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [authService]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      // Future: clear TanStack Query cache here.
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
    }),
    [user, isAuthenticated, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access the auth context.
 *
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
