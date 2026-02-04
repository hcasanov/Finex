import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { processExtractionJob, type ExtractionJobData } from "./extractionWorker";
import { db } from "@/infrastructure/database/connection";
import {
  PostgresExtractionRepository,
  PostgresTaskRepository,
  PostgresReportRepository,
} from "@/infrastructure/database/repositories";
import { FMPFinancialDataProvider } from "@/infrastructure/external-services/fmp";
import { GeminiEmbeddingService, GeminiLLMService } from "@/infrastructure/external-services/gemini";
import { VercelBlobStorageService } from "@/infrastructure/external-services/vercel-blob";
import { ReactPDFGenerator } from "@/infrastructure/pdf";

const QUEUE_NAME = "extractions";

interface WorkerConfig {
  redisUrl: string;
  concurrency?: number;
}

export function createExtractionWorker(config: WorkerConfig): Worker {
  const { redisUrl, concurrency = 1 } = config;

  // Create Redis connection
  const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  // Initialize dependencies
  const extractionRepository = new PostgresExtractionRepository(db);
  const taskRepository = new PostgresTaskRepository(db);
  const reportRepository = new PostgresReportRepository(db);

  const financialDataProvider = new FMPFinancialDataProvider(
    process.env["FMP_API_KEY"] ?? "",
    process.env["FMP_BASE_URL"] ?? "https://financialmodelingprep.com/api/v3"
  );
  const embeddingService = new GeminiEmbeddingService();
  const llmService = new GeminiLLMService();
  const storageService = new VercelBlobStorageService();
  const pdfGenerator = new ReactPDFGenerator();

  // Create the worker
  const worker = new Worker<ExtractionJobData>(
    QUEUE_NAME,
    async (job: Job<ExtractionJobData>) => {
      console.log(`[Worker] Processing job ${job.id}: ${job.data.symbol}`);

      await processExtractionJob(job.data, {
        extractionRepository,
        financialDataProvider,
        embeddingService,
        llmService,
        storageService,
        pdfGenerator,
        taskRepository,
        reportRepository,
      });

      console.log(`[Worker] Completed job ${job.id}`);
    },
    {
      connection,
      concurrency,
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 5000 },
    }
  );

  // Event handlers
  worker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("[Worker] Worker error:", err);
  });

  return worker;
}

// Standalone worker script entry point
// Run with: npx tsx src/infrastructure/queue/workers/bullmqWorker.ts
if (require.main === module) {
  const redisUrl = process.env["UPSTASH_REDIS_REST_URL"];

  if (!redisUrl) {
    console.error("UPSTASH_REDIS_REST_URL environment variable is required");
    process.exit(1);
  }

  console.log("[Worker] Starting extraction worker...");

  const worker = createExtractionWorker({
    redisUrl,
    concurrency: 2,
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log("[Worker] Shutting down...");
    await worker.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.log("[Worker] Worker started, waiting for jobs...");
}
