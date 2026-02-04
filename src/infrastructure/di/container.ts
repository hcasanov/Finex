import { db } from "../database/connection";
import {
  PostgresCompanyRepository,
  PostgresExtractionRepository,
  PostgresTaskRepository,
  PostgresReportRepository,
  PostgresVectorStore,
} from "../database/repositories";
import { FMPFinancialDataProvider } from "../external-services/fmp";
import { GeminiEmbeddingService, GeminiLLMService } from "../external-services/gemini";
import { VercelBlobStorageService } from "../external-services/vercel-blob";
import { BullMQQueueService } from "../queue/services/BullMQQueueService";
import { RateLimitService } from "../services/RateLimitService";
import {
  SearchCompaniesUseCase,
  GetCompanyDetailsUseCase,
} from "@/application/use-cases/company";
import {
  CreateExtractionUseCase,
  GetExtractionStatusUseCase,
  CancelExtractionUseCase,
  ListExtractionsUseCase,
} from "@/application/use-cases/extraction";
import { ListTasksUseCase } from "@/application/use-cases/task";
import {
  GetReportUseCase,
  ListReportsUseCase,
  GetReportByExtractionUseCase,
} from "@/application/use-cases/report";
import type { IQueueService, QueueJobData } from "@/application/ports/IQueueService";

// Simple queue service for local development when Redis is not available
class SimpleQueueService implements IQueueService {
  private jobs: Map<string, { data: QueueJobData; status: string; createdAt: Date }> = new Map();

  async enqueue(jobName: string, data: QueueJobData): Promise<string> {
    const jobId = data.extractionId || crypto.randomUUID();
    this.jobs.set(jobId, { data, status: "waiting", createdAt: new Date() });
    console.log(`[SimpleQueue] Enqueued job ${jobId} for ${jobName}`);
    console.log(`[SimpleQueue] Note: Using in-memory queue. For production, configure UPSTASH_REDIS_REST_URL`);
    return jobId;
  }

  async getJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return null;
    return {
      id: jobId,
      data: job.data,
      status: job.status as "waiting" | "active" | "completed" | "failed",
      progress: 0,
      createdAt: job.createdAt,
    };
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = "cancelled";
      return true;
    }
    return false;
  }

  async getQueueStatus() {
    let waiting = 0;
    let active = 0;
    let completed = 0;
    let failed = 0;

    const jobs = Array.from(this.jobs.values());
    for (const job of jobs) {
      switch (job.status) {
        case "waiting":
          waiting++;
          break;
        case "active":
          active++;
          break;
        case "completed":
          completed++;
          break;
        case "failed":
          failed++;
          break;
      }
    }

    return { waiting, active, completed, failed };
  }
}

// Create queue service based on environment
function createQueueService(): IQueueService {
  const redisUrl = process.env["UPSTASH_REDIS_REST_URL"];

  if (redisUrl) {
    console.log("[Container] Using BullMQ queue service with Redis");
    return new BullMQQueueService(redisUrl);
  }

  console.log("[Container] Using SimpleQueueService (development mode)");
  return new SimpleQueueService();
}

// Lazy initialization to avoid issues with environment variables
let _container: ReturnType<typeof createContainer> | null = null;

function createContainer() {
  // Repositories
  const companyRepository = new PostgresCompanyRepository(db);
  const extractionRepository = new PostgresExtractionRepository(db);
  const taskRepository = new PostgresTaskRepository(db);
  const reportRepository = new PostgresReportRepository(db);
  const vectorStore = new PostgresVectorStore(db);

  // Services
  const rateLimitService = new RateLimitService(db);

  // External services
  const financialDataProvider = new FMPFinancialDataProvider(
    process.env["FMP_API_KEY"] ?? "",
    process.env["FMP_BASE_URL"] ?? "https://financialmodelingprep.com/api/v3"
  );
  const embeddingService = new GeminiEmbeddingService();
  const llmService = new GeminiLLMService();
  const storageService = new VercelBlobStorageService();
  const queueService = createQueueService();

  // Use cases
  const searchCompaniesUseCase = new SearchCompaniesUseCase(financialDataProvider);
  const getCompanyDetailsUseCase = new GetCompanyDetailsUseCase(
    companyRepository,
    financialDataProvider
  );
  const createExtractionUseCase = new CreateExtractionUseCase(
    companyRepository,
    extractionRepository,
    taskRepository,
    queueService,
    financialDataProvider
  );
  const getExtractionStatusUseCase = new GetExtractionStatusUseCase(
    extractionRepository,
    taskRepository
  );
  const cancelExtractionUseCase = new CancelExtractionUseCase(
    extractionRepository,
    queueService
  );
  const listExtractionsUseCase = new ListExtractionsUseCase(extractionRepository);
  const listTasksUseCase = new ListTasksUseCase(taskRepository, extractionRepository);
  const getReportUseCase = new GetReportUseCase(reportRepository);
  const listReportsUseCase = new ListReportsUseCase(reportRepository);
  const getReportByExtractionUseCase = new GetReportByExtractionUseCase(
    reportRepository
  );

  return {
    // Repositories
    companyRepository,
    extractionRepository,
    taskRepository,
    reportRepository,
    vectorStore,

    // Services
    rateLimitService,
    financialDataProvider,
    embeddingService,
    llmService,
    storageService,
    queueService,

    // Use cases
    searchCompaniesUseCase,
    getCompanyDetailsUseCase,
    createExtractionUseCase,
    getExtractionStatusUseCase,
    cancelExtractionUseCase,
    listExtractionsUseCase,
    listTasksUseCase,
    getReportUseCase,
    listReportsUseCase,
    getReportByExtractionUseCase,
  };
}

export function getContainer() {
  if (!_container) {
    _container = createContainer();
  }
  return _container;
}

export type Container = ReturnType<typeof createContainer>;
