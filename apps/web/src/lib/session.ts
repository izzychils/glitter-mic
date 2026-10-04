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
    console.log("[Session] Stored session token:", token.substring(0, 8) + "...");
  } catch (error) {
    console.warn("Failed to store session token:", error);
  }
}

/**
 * Get session token from localStorage
 */
export function getSessionToken(): string | null {
  try {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (token) {
      console.log("[Session] Retrieved session token:", token.substring(0, 8) + "...");
    }
    return token;
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
    console.log("[Session] Cleared session token");
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
    console.log("[Session] Sending request with both cookie and header token");
  } else {
    console.log("[Session] Sending request with cookie only (no token in localStorage)");
  }

  return fetch(url, enhancedOptions);
}
