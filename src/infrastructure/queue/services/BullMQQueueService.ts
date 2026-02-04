import { Queue, Job } from "bullmq";
import IORedis from "ioredis";
import type { IQueueService, QueueJobData, QueueJob } from "@/application/ports/IQueueService";

const QUEUE_NAME = "extractions";

export class BullMQQueueService implements IQueueService {
  private queue: Queue;
  private connection: IORedis;

  constructor(redisUrl: string) {
    // Parse Upstash Redis URL and create connection
    this.connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    this.queue = new Queue(QUEUE_NAME, {
      connection: this.connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
      },
    });
  }

  async enqueue(jobName: string, data: QueueJobData): Promise<string> {
    const job = await this.queue.add(jobName, data, {
      jobId: data.extractionId, // Use extractionId as job ID for easy lookup
    });
    return job.id ?? data.extractionId;
  }

  async getJob(jobId: string): Promise<QueueJob | null> {
    const job = await this.queue.getJob(jobId);
    if (!job) return null;

    return this.mapJobToQueueJob(job);
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = await this.queue.getJob(jobId);
    if (!job) return false;

    const state = await job.getState();

    // Can only cancel waiting or delayed jobs
    if (state === "waiting" || state === "delayed") {
      await job.remove();
      return true;
    }

    // For active jobs, we can try to discard them
    if (state === "active") {
      await job.discard();
      return true;
    }

    return false;
  }

  async getQueueStatus(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }

  private async mapJobToQueueJob(job: Job): Promise<QueueJob> {
    const state = await job.getState();

    let status: QueueJob["status"];
    switch (state) {
      case "waiting":
      case "delayed":
      case "prioritized":
        status = "waiting";
        break;
      case "active":
        status = "active";
        break;
      case "completed":
        status = "completed";
        break;
      case "failed":
        status = "failed";
        break;
      default:
        status = "waiting";
    }

    return {
      id: job.id ?? "",
      data: job.data as QueueJobData,
      status,
      progress: typeof job.progress === "number" ? job.progress : 0,
      failedReason: job.failedReason,
      createdAt: new Date(job.timestamp),
    };
  }

  async close(): Promise<void> {
    await this.queue.close();
    await this.connection.quit();
  }

  getQueue(): Queue {
    return this.queue;
  }

  getConnection(): IORedis {
    return this.connection;
  }
}
