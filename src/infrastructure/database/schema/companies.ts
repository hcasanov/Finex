import { pgTable, uuid, varchar, text, decimal, timestamp } from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  symbol: varchar("symbol", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  exchange: varchar("exchange", { length: 50 }),
  sector: varchar("sector", { length: 100 }),
  industry: varchar("industry", { length: 100 }),
  country: varchar("country", { length: 100 }),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  logoUrl: text("logo_url"),
  website: text("website"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CompanyRow = typeof companies.$inferSelect;
export type NewCompanyRow = typeof companies.$inferInsert;
