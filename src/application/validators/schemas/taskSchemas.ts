import { z } from "zod";

export const listTasksSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  status: z
    .enum(["pending", "processing", "completed", "failed", "cancelled"])
    .optional(),
  extractionId: z.string().uuid().optional(),
});

export type ListTasksInput = z.infer<typeof listTasksSchema>;

export const getTaskSchema = z.object({
  id: z.string().uuid("Invalid task ID"),
});

export type GetTaskInput = z.infer<typeof getTaskSchema>;
