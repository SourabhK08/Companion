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
    clearAccessToken();
    throw new Error(errorMessage);
  }

  return payload as T;
}
