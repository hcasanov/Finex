import { pgTable, uuid, varchar, integer, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { companies } from "./companies";

export const extractions = pgTable("extractions", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  fiscalYear: integer("fiscal_year").notNull(),
  requestedMetrics: jsonb("requested_metrics").$type<string[]>().notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ExtractionRow = typeof extractions.$inferSelect;
export type NewExtractionRow = typeof extractions.$inferInsert;
