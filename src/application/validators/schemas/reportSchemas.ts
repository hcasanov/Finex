import { z } from "zod";

export const getReportSchema = z.object({
  id: z.string().uuid("Invalid report ID"),
});

export type GetReportInput = z.infer<typeof getReportSchema>;

export const listReportsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  companyId: z.string().uuid().optional(),
});

export type ListReportsInput = z.infer<typeof listReportsSchema>;

export const downloadReportSchema = z.object({
  id: z.string().uuid("Invalid report ID"),
});

export type DownloadReportInput = z.infer<typeof downloadReportSchema>;
