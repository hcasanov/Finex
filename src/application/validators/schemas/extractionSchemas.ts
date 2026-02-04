import { z } from "zod";
import { FINANCIAL_METRICS } from "@/lib/constants";

const validMetricCodes = FINANCIAL_METRICS.map((m) => m.code);

export const createExtractionSchema = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(10)
    .regex(
      /^[A-Za-z]{1,5}(\.[A-Za-z]{1,2})?$/,
      "Invalid stock symbol format"
    )
    .transform((val) => val.toUpperCase()),
  fiscalYear: z
    .number()
    .int()
    .min(2000, "Fiscal year must be 2000 or later")
    .max(new Date().getFullYear(), "Fiscal year cannot be in the future"),
  metrics: z
    .array(z.string())
    .min(1, "At least one metric must be selected")
    .refine(
      (metrics) => metrics.every((m) => validMetricCodes.includes(m)),
      { message: "One or more invalid metric codes" }
    ),
});

export type CreateExtractionInput = z.infer<typeof createExtractionSchema>;

export const getExtractionSchema = z.object({
  id: z.string().uuid("Invalid extraction ID"),
});

export type GetExtractionInput = z.infer<typeof getExtractionSchema>;

export const cancelExtractionSchema = z.object({
  id: z.string().uuid("Invalid extraction ID"),
});

export type CancelExtractionInput = z.infer<typeof cancelExtractionSchema>;

export const listExtractionsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  status: z
    .enum(["pending", "processing", "completed", "failed", "cancelled"])
    .optional(),
  companyId: z.string().uuid().optional(),
});

export type ListExtractionsInput = z.infer<typeof listExtractionsSchema>;
