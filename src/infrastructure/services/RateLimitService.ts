import { eq, and, gt, sql } from "drizzle-orm";
import { rateLimits } from "../database/schema/rateLimits";
import type { Database } from "../database/connection";

export interface RateLimitConfig {
  // Maximum number of requests allowed in the window
  maxRequests: number;
  // Window duration in milliseconds
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  total: number;
}

// Default configs for different actions
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  extraction: {
    maxRequests: 2, // 2 reports per day
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
};

export class RateLimitService {
  constructor(private db: Database) {}

  /**
   * Check if an action is allowed for a given identifier
   * @param identifier Unique identifier for the user (IP + cookie hash)
   * @param action The action being rate limited
   * @param config Optional custom config, defaults to predefined config
   */
  async checkLimit(
    identifier: string,
    action: string,
    config?: RateLimitConfig
  ): Promise<RateLimitResult> {
    const { maxRequests, windowMs } = config ?? RATE_LIMIT_CONFIGS[action] ?? {
      maxRequests: 10,
      windowMs: 60 * 1000,
    };

    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);

    // Find existing rate limit record for this identifier and action
    const existing = await this.db
      .select()
      .from(rateLimits)
      .where(
        and(
          eq(rateLimits.identifier, identifier),
          eq(rateLimits.action, action),
          gt(rateLimits.windowStart, windowStart)
        )
      )
      .limit(1);

    const record = existing[0];

    if (record) {
      // Record exists and is within the current window
      const remaining = Math.max(0, maxRequests - record.count);
      const resetAt = new Date(record.windowStart.getTime() + windowMs);

      return {
        allowed: record.count < maxRequests,
        remaining,
        resetAt,
        total: maxRequests,
      };
    }

    // No record or expired, user has full quota
    const resetAt = new Date(now.getTime() + windowMs);

    return {
      allowed: true,
      remaining: maxRequests,
      resetAt,
      total: maxRequests,
    };
  }

  /**
   * Increment the counter for a rate-limited action
   * Call this AFTER successfully performing the action
   */
  async increment(
    identifier: string,
    action: string,
    config?: RateLimitConfig
  ): Promise<RateLimitResult> {
    const { maxRequests, windowMs } = config ?? RATE_LIMIT_CONFIGS[action] ?? {
      maxRequests: 10,
      windowMs: 60 * 1000,
    };

    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);
    const expiresAt = new Date(now.getTime() + windowMs);

    // Find existing rate limit record
    const existing = await this.db
      .select()
      .from(rateLimits)
      .where(
        and(
          eq(rateLimits.identifier, identifier),
          eq(rateLimits.action, action),
          gt(rateLimits.windowStart, windowStart)
        )
      )
      .limit(1);

    const record = existing[0];

    if (record) {
      // Update existing record
      const newCount = record.count + 1;

      await this.db
        .update(rateLimits)
        .set({
          count: newCount,
          updatedAt: now,
        })
        .where(eq(rateLimits.id, record.id));

      const remaining = Math.max(0, maxRequests - newCount);
      const resetAt = new Date(record.windowStart.getTime() + windowMs);

      return {
        allowed: newCount <= maxRequests,
        remaining,
        resetAt,
        total: maxRequests,
      };
    }

    // Create new record
    await this.db.insert(rateLimits).values({
      identifier,
      action,
      count: 1,
      windowStart: now,
      expiresAt,
    });

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: expiresAt,
      total: maxRequests,
    };
  }

  /**
   * Clean up expired rate limit records
   */
  async cleanup(): Promise<number> {
    const now = new Date();

    // Count records to be deleted first
    const toDelete = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(rateLimits)
      .where(sql`${rateLimits.expiresAt} < ${now}`);

    const count = toDelete[0]?.count ?? 0;

    if (count > 0) {
      await this.db
        .delete(rateLimits)
        .where(sql`${rateLimits.expiresAt} < ${now}`);
    }

    return count;
  }

  /**
   * Get current usage for an identifier and action
   */
  async getUsage(
    identifier: string,
    action: string
  ): Promise<{ count: number; windowStart: Date | null }> {
    const config = RATE_LIMIT_CONFIGS[action] ?? { windowMs: 24 * 60 * 60 * 1000 };
    const windowStart = new Date(Date.now() - config.windowMs);

    const existing = await this.db
      .select({
        count: rateLimits.count,
        windowStart: rateLimits.windowStart,
      })
      .from(rateLimits)
      .where(
        and(
          eq(rateLimits.identifier, identifier),
          eq(rateLimits.action, action),
          gt(rateLimits.windowStart, windowStart)
        )
      )
      .limit(1);

    const record = existing[0];

    return {
      count: record?.count ?? 0,
      windowStart: record?.windowStart ?? null,
    };
  }
}
