import { z } from "zod";

export const searchCompaniesSchema = z.object({
  query: z.string().min(1, "Search query is required").max(100),
  limit: z.number().int().min(1).max(50).default(10),
});

export type SearchCompaniesInput = z.infer<typeof searchCompaniesSchema>;

export const getCompanySchema = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(10)
    .regex(
      /^[A-Za-z]{1,5}(\.[A-Za-z]{1,2})?$/,
      "Invalid stock symbol format"
    )
    .transform((val) => val.toUpperCase()),
});

export type GetCompanyInput = z.infer<typeof getCompanySchema>;
