import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const USER_ID_COOKIE = "fo_uid";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Generate a random identifier for anonymous users
 */
function generateUserId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Get the client IP address from request headers
 */
export function getClientIP(request: NextRequest): string {
  // Try various headers that might contain the real IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Vercel-specific header
  const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return "unknown";
}

/**
 * Get or create a persistent user identifier from cookies
 * This identifier persists across sessions for the same browser
 */
export async function getOrCreateUserId(): Promise<string> {
  const cookieStore = await cookies();
  const existingId = cookieStore.get(USER_ID_COOKIE)?.value;

  if (existingId) {
    return existingId;
  }

  // Generate new ID - it will be set by the API response
  return generateUserId();
}

/**
 * Create a unique identifier for rate limiting
 * Combines IP address and browser cookie for better accuracy
 */
export async function getUserIdentifier(request: NextRequest): Promise<{
  identifier: string;
  userId: string;
  isNew: boolean;
}> {
  const ip = getClientIP(request);
  const cookieStore = await cookies();
  const existingUserId = cookieStore.get(USER_ID_COOKIE)?.value;

  const isNew = !existingUserId;
  const userId = existingUserId ?? generateUserId();

  // Combine IP and user ID for the identifier
  // This makes it harder to bypass rate limiting by just clearing cookies
  const identifier = `${ip}:${userId}`;

  return { identifier, userId, isNew };
}

/**
 * Set the user ID cookie in the response
 */
export function setUserIdCookie(response: Response, userId: string): Response {
  const cookie = `${USER_ID_COOKIE}=${userId}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax`;

  const newHeaders = new Headers(response.headers);
  newHeaders.append("Set-Cookie", cookie);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

export { USER_ID_COOKIE, COOKIE_MAX_AGE };
