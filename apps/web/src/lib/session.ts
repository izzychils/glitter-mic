/**
 * Session management utilities
 * Handles both cookie-based and header-based sessions for cross-origin compatibility
 */

const SESSION_TOKEN_KEY = "glitter_session_token";

/**
 * Store session token in localStorage (backup for when cookies don't work)
 */
export function storeSessionToken(token: string): void {
  try {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  } catch (error) {
    console.warn("Failed to store session token:", error);
  }
}

/**
 * Get session token from localStorage
 */
export function getSessionToken(): string | null {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  } catch (error) {
    console.warn("Failed to get session token:", error);
    return null;
  }
}

/**
 * Clear session token from localStorage
 */
export function clearSessionToken(): void {
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch (error) {
    console.warn("Failed to clear session token:", error);
  }
}

/**
 * Enhanced fetch that includes session token in header if cookies might be blocked
 */
export async function sessionFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getSessionToken();
  const headers = new Headers(options.headers);

  // Always send credentials for cookie-based auth
  const enhancedOptions: RequestInit = {
    ...options,
    credentials: "include",
    headers,
  };

  // If we have a token, also send it via header as backup
  if (token) {
    headers.set("X-Session-Token", token);
  }

  return fetch(url, enhancedOptions);
}
