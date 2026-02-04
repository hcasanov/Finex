import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Redis (Upstash) - Optional for development
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  // Financial Modeling Prep
  FMP_API_KEY: z.string().min(1),
  FMP_BASE_URL: z.string().url().default("https://financialmodelingprep.com/api/v3"),

  // Gemini
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),

  // Vercel Blob
  BLOB_READ_WRITE_TOKEN: z.string().min(1),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Webhook security (optional)
  WEBHOOK_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = getEnv();
