import { pgTable, uuid, varchar, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { extractions } from "./extractions";
import { companies } from "./companies";
import type { ExtractedMetric } from "@/domain/entities/Report";

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  extractionId: uuid("extraction_id")
    .notNull()
    .unique()
    .references(() => extractions.id, { onDelete: "cascade" }),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  pdfUrl: text("pdf_url"),
  pdfSizeBytes: integer("pdf_size_bytes"),
  extractedMetrics: jsonb("extracted_metrics").$type<ExtractedMetric[]>().notNull(),
  dataSources: jsonb("data_sources").$type<string[]>().default([]),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ReportRow = typeof reports.$inferSelect;
export type NewReportRow = typeof reports.$inferInsert;
