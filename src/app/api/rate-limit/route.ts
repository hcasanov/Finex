import { NextRequest, NextResponse } from "next/server";
import { getContainer } from "@/infrastructure/di/container";
import { getUserIdentifier, setUserIdCookie } from "@/lib/userIdentifier";
import { RATE_LIMIT_CONFIGS } from "@/infrastructure/services/RateLimitService";

/**
 * GET /api/rate-limit
 * Returns the current rate limit status for the user
 */
export async function GET(request: NextRequest) {
  try {
    const { identifier, userId, isNew } = await getUserIdentifier(request);
    const container = getContainer();

    const action = request.nextUrl.searchParams.get("action") ?? "extraction";
    const config = RATE_LIMIT_CONFIGS[action];

    if (!config) {
      return NextResponse.json(
        { error: "Unknown action" },
        { status: 400 }
      );
    }

    const rateLimitCheck = await container.rateLimitService.checkLimit(
      identifier,
      action
    );

    let response = NextResponse.json({
      action,
      limit: rateLimitCheck.total,
      remaining: rateLimitCheck.remaining,
      used: rateLimitCheck.total - rateLimitCheck.remaining,
      resetAt: rateLimitCheck.resetAt.toISOString(),
      windowMs: config.windowMs,
    });

    // Add standard rate limit headers
    response.headers.set("X-RateLimit-Limit", rateLimitCheck.total.toString());
    response.headers.set("X-RateLimit-Remaining", rateLimitCheck.remaining.toString());
    response.headers.set("X-RateLimit-Reset", rateLimitCheck.resetAt.toISOString());

    // Set user ID cookie if this is a new user
    if (isNew) {
      const cookieResponse = setUserIdCookie(response, userId);
      return new NextResponse(cookieResponse.body, {
        status: cookieResponse.status,
        headers: cookieResponse.headers,
      });
    }

    return response;
  } catch (error) {
    console.error("Error checking rate limit:", error);
    return NextResponse.json(
      { error: "Failed to check rate limit" },
      { status: 500 }
    );
  }
}
