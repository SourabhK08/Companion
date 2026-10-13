const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const ACCESS_TOKEN_STORAGE_KEY = "modhuralap_access_token";

let inMemoryAccessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function clearAccessToken(): void {
  inMemoryAccessToken = null;
}

function resolveUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return new URL(path, `${API_BASE_URL}/`).toString();
}

async function readJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(resolveUrl("/api/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const payload = (await readJson<{ data?: { accessToken?: string }; message?: string }>(
        response
      )) ?? {
        data: {},
        message: "Unable to refresh session",
      };

      if (!response.ok || !payload?.data?.accessToken) {
        clearAccessToken();
        return null;
      }

      setAccessToken(payload.data.accessToken);
      return payload.data.accessToken;
    } catch {
      clearAccessToken();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  const token = getAccessToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (
    options.body &&
    typeof options.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const requestOptions: RequestInit = {
    ...options,
    credentials: "include",
    headers,
  };

  let response = await fetch(resolveUrl(path), requestOptions);

  if (
    response.status === 401 &&
    !path.includes("/api/auth/refresh") &&
    !path.includes("/api/auth/login") &&
    !path.includes("/api/auth/register")
  ) {
    const refreshedToken = await refreshAccessToken();

    if (refreshedToken) {
      headers.set("Authorization", `Bearer ${refreshedToken}`);
      response = await fetch(resolveUrl(path), {
        ...requestOptions,
        headers,
      });
    }
  }

  const payload = (await readJson<T>(response)) as T | null;

  if (!response.ok) {
    const errorMessage =
      (payload as { message?: string } | null)?.message ?? "Request failed";
    // Only an auth failure means our token is bad — a 400/409/429 etc.
    // should not log the user out of their in-memory session.
    if (response.status === 401) {
      clearAccessToken();
    }
    throw new ApiError(errorMessage, response.status);
  }

  return payload as T;
}

/**
 * Error thrown by apiFetch for non-2xx responses.
 * Extends Error so existing `error instanceof Error` checks keep working,
 * while callers that care can branch on `status`.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}
