import { NextRequest, NextResponse } from "next/server";
import { getContainer } from "@/infrastructure/di/container";
import {
  createExtractionSchema,
  listExtractionsSchema,
} from "@/application/validators/schemas/extractionSchemas";
import { CompanyNotFoundError } from "@/domain/errors/CompanyNotFoundError";
import { getUserIdentifier, setUserIdCookie } from "@/lib/userIdentifier";

// Rate limit error response
class RateLimitExceededError extends Error {
  constructor(
    public remaining: number,
    public resetAt: Date,
    public total: number
  ) {
    super("Rate limit exceeded");
    this.name = "RateLimitExceededError";
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!)
      : 1;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 20;
    const status = searchParams.get("status") ?? undefined;
    const companyId = searchParams.get("companyId") ?? undefined;

    const validation = listExtractionsSchema.safeParse({
      page,
      limit,
      status,
      companyId,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const container = getContainer();
    const result = await container.listExtractionsUseCase.execute(validation.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing extractions:", error);
    return NextResponse.json(
      { error: "Failed to list extractions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user identifier for rate limiting
    const { identifier, userId, isNew } = await getUserIdentifier(request);

    const container = getContainer();

    // Check rate limit BEFORE processing the request
    const rateLimitCheck = await container.rateLimitService.checkLimit(
      identifier,
      "extraction"
    );

    if (!rateLimitCheck.allowed) {
      throw new RateLimitExceededError(
        rateLimitCheck.remaining,
        rateLimitCheck.resetAt,
        rateLimitCheck.total
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createExtractionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Create the extraction
    const result = await container.createExtractionUseCase.execute(validation.data);

    // Increment rate limit counter AFTER successful creation
    const rateLimitResult = await container.rateLimitService.increment(
      identifier,
      "extraction"
    );

    // Build response with rate limit headers
    let response = NextResponse.json(result, { status: 201 });

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", rateLimitResult.total.toString());
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    response.headers.set("X-RateLimit-Reset", rateLimitResult.resetAt.toISOString());

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
    if (error instanceof RateLimitExceededError) {
      const response = NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `You have reached the maximum of ${error.total} report generations per day. Please try again after ${error.resetAt.toISOString()}.`,
          remaining: error.remaining,
          resetAt: error.resetAt.toISOString(),
        },
        { status: 429 }
      );

      response.headers.set("X-RateLimit-Limit", error.total.toString());
      response.headers.set("X-RateLimit-Remaining", error.remaining.toString());
      response.headers.set("X-RateLimit-Reset", error.resetAt.toISOString());
      response.headers.set("Retry-After", Math.ceil((error.resetAt.getTime() - Date.now()) / 1000).toString());

      return response;
    }

    if (error instanceof CompanyNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Error creating extraction:", error);
    return NextResponse.json(
      { error: "Failed to create extraction" },
      { status: 500 }
    );
  }
}
