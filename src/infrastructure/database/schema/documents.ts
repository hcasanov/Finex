import { pgTable, uuid, varchar, text, integer, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { extractions } from "./extractions";
import { companies } from "./companies";

// Note: pgvector extension must be enabled in PostgreSQL
// Run: CREATE EXTENSION IF NOT EXISTS vector;

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    extractionId: uuid("extraction_id")
      .notNull()
      .references(() => extractions.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    sourceType: varchar("source_type", { length: 50 }).notNull(),
    sourceUrl: text("source_url"),
    sourceDate: timestamp("source_date", { withTimezone: true }),
    content: text("content").notNull(),
    chunkIndex: integer("chunk_index").notNull().default(0),
    // Embedding will be stored as vector(1536) for text-embedding-004
    // Using text for now since Drizzle doesn't have native vector support
    embedding: text("embedding"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    extractionIdx: index("idx_documents_extraction").on(table.extractionId),
    companyIdx: index("idx_documents_company").on(table.companyId),
  })
);

export type DocumentRow = typeof documents.$inferSelect;
export type NewDocumentRow = typeof documents.$inferInsert;
