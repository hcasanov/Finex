import { pgTable, uuid, varchar, integer, timestamp, index } from "drizzle-orm/pg-core";

export const rateLimits = pgTable(
  "rate_limits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Identifier: combination of IP + browser fingerprint cookie
    identifier: varchar("identifier", { length: 255 }).notNull(),
    // Action being rate limited (e.g., "extraction")
    action: varchar("action", { length: 50 }).notNull(),
    // Number of requests made in the current window
    count: integer("count").notNull().default(0),
    // Start of the current rate limit window
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    // When this record expires (for cleanup)
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    identifierActionIdx: index("idx_rate_limits_identifier_action").on(
      table.identifier,
      table.action
    ),
    expiresAtIdx: index("idx_rate_limits_expires_at").on(table.expiresAt),
  })
);

export type RateLimitRow = typeof rateLimits.$inferSelect;
export type NewRateLimitRow = typeof rateLimits.$inferInsert;
