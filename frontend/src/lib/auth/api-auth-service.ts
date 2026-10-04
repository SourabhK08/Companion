import type { AuthResult, AuthService, AuthUser, LoginCredentials } from "@/lib/auth/types";
import { apiFetch, clearAccessToken, setAccessToken } from "@/lib/api/client";

interface AuthApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface ApiUser {
  id: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  gender?: string | null;
  city?: string | null;
  dateOfBirth?: Date | string | null;
  avatar?: string | null;
  bio?: string | null;
  interests?: string[];
  languages?: string[];
  isCompanion?: boolean;
  isCoFounder?: boolean;
  linkedinUrl?: string | null;
  authProvider?: string;
  createdAt?: string | Date;
}

function mapUser(user: ApiUser | null | undefined): AuthUser | null {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.fullName ?? user.email.split("@")[0],
    fullName: user.fullName ?? user.email.split("@")[0],
    avatarUrl: user.avatar ?? undefined,
    phone: user.phone ?? undefined,
    gender: user.gender ?? undefined,
    city: user.city ?? undefined,
    dateOfBirth: user.dateOfBirth ?? undefined,
    bio: user.bio ?? undefined,
    interests: user.interests ?? [],
    languages: user.languages ?? [],
    isCompanion: user.isCompanion ?? false,
    isCoFounder: user.isCoFounder ?? false,
    linkedinUrl: user.linkedinUrl ?? null,
    isVerified: user.isCompanion ?? false,
  };
}

export class ApiAuthService implements AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response = await apiFetch<AuthApiResponse<{ user: ApiUser; accessToken: string }>>(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );

      if (!response.success || !response.data?.user) {
        return {
          success: false,
          error: response.message ?? "Login failed.",
        };
      }

      setAccessToken(response.data.accessToken);

      return {
        success: true,
        user: mapUser(response.data.user) ?? undefined,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to login. Please try again.",
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await apiFetch<{ success: boolean; message?: string }>("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      clearAccessToken();
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await apiFetch<AuthApiResponse<{ user: ApiUser }>>("/api/auth/me", {
        method: "GET",
      });

      return mapUser(response.data?.user ?? null);
    } catch {
      clearAccessToken();
      return null;
    }
  }

  async register(data: {
    fullName: string;
    email: string;
    password: string;
    gender?: string;
    phone?: string;
    city?: string;
    dateOfBirth?: string;
  }): Promise<AuthResult> {
    try {
      const response = await apiFetch<AuthApiResponse<{ user: ApiUser; accessToken: string }>>(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: data.fullName,
            email: data.email,
            password: data.password,
            gender: data.gender,
            phone: data.phone,
            city: data.city,
          }),
        }
      );

      if (!response.success || !response.data?.user) {
        return {
          success: false,
          error: response.message ?? "Registration failed.",
        };
      }

      setAccessToken(response.data.accessToken);

      return {
        success: true,
        user: mapUser(response.data.user) ?? undefined,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete registration. Please try again.",
      };
    }
  }
}
