import { pgTable, uuid, varchar, integer, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { extractions } from "./extractions";

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  extractionId: uuid("extraction_id")
    .notNull()
    .references(() => extractions.id, { onDelete: "cascade" }),
  stepName: varchar("step_name", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  progress: integer("progress").notNull().default(0),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type TaskRow = typeof tasks.$inferSelect;
export type NewTaskRow = typeof tasks.$inferInsert;
