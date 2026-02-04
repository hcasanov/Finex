export interface QueueJobData {
  extractionId: string;
  companyId: string;
  companySymbol: string;
  companyName: string;
  fiscalYear: number;
  requestedMetrics: string[];
}

export interface QueueJob {
  id: string;
  data: QueueJobData;
  status: "waiting" | "active" | "completed" | "failed";
  progress: number;
  failedReason?: string;
  createdAt: Date;
}

export interface IQueueService {
  enqueue(jobName: string, data: QueueJobData): Promise<string>;
  getJob(jobId: string): Promise<QueueJob | null>;
  cancelJob(jobId: string): Promise<boolean>;
  getQueueStatus(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }>;
}
