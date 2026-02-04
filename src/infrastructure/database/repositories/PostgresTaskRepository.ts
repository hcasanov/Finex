import { eq, and } from "drizzle-orm";
import type { Database } from "../connection";
import { tasks, type TaskRow } from "../schema/tasks";
import type {
  ITaskRepository,
  TaskFilters,
} from "@/domain/repositories/ITaskRepository";
import { Task, type ExtractionStep } from "@/domain/entities/Task";
import type { TaskStatusType } from "@/domain/value-objects/TaskStatus";

export class PostgresTaskRepository implements ITaskRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Task | null> {
    const rows = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    const row = rows[0];
    return row ? this.toDomain(row) : null;
  }

  async findByExtractionId(extractionId: string): Promise<Task[]> {
    const rows = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.extractionId, extractionId));

    return rows.map((row) => this.toDomain(row));
  }

  async findByExtractionAndStep(
    extractionId: string,
    stepName: ExtractionStep
  ): Promise<Task | null> {
    const rows = await this.db
      .select()
      .from(tasks)
      .where(
        and(eq(tasks.extractionId, extractionId), eq(tasks.stepName, stepName))
      )
      .limit(1);

    const row = rows[0];
    return row ? this.toDomain(row) : null;
  }

  async findAll(filters?: TaskFilters): Promise<Task[]> {
    const conditions = [];

    if (filters?.extractionId) {
      conditions.push(eq(tasks.extractionId, filters.extractionId));
    }
    if (filters?.status) {
      conditions.push(eq(tasks.status, filters.status));
    }
    if (filters?.stepName) {
      conditions.push(eq(tasks.stepName, filters.stepName));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await this.db.select().from(tasks).where(whereClause);

    return rows.map((row) => this.toDomain(row));
  }

  async save(task: Task): Promise<void> {
    await this.db.insert(tasks).values({
      id: task.id,
      extractionId: task.extractionId,
      stepName: task.stepName,
      status: task.status,
      progress: task.progress,
      startedAt: task.startedAt,
      completedAt: task.completedAt,
      errorMessage: task.errorMessage,
      metadata: task.metadata,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
  }

  async saveMany(taskList: Task[]): Promise<void> {
    if (taskList.length === 0) return;

    await this.db.insert(tasks).values(
      taskList.map((task) => ({
        id: task.id,
        extractionId: task.extractionId,
        stepName: task.stepName,
        status: task.status,
        progress: task.progress,
        startedAt: task.startedAt,
        completedAt: task.completedAt,
        errorMessage: task.errorMessage,
        metadata: task.metadata,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }))
    );
  }

  async update(task: Task): Promise<void> {
    await this.db
      .update(tasks)
      .set({
        status: task.status,
        progress: task.progress,
        startedAt: task.startedAt,
        completedAt: task.completedAt,
        errorMessage: task.errorMessage,
        metadata: task.metadata,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, task.id));
  }

  async updateByExtractionAndStep(
    extractionId: string,
    stepName: ExtractionStep,
    updates: Partial<{
      status: TaskStatusType;
      progress: number;
      startedAt: Date;
      completedAt: Date;
      errorMessage: string;
      metadata: Record<string, unknown>;
    }>
  ): Promise<void> {
    await this.db
      .update(tasks)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(eq(tasks.extractionId, extractionId), eq(tasks.stepName, stepName))
      );
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(tasks).where(eq(tasks.id, id));
  }

  async deleteByExtractionId(extractionId: string): Promise<void> {
    await this.db.delete(tasks).where(eq(tasks.extractionId, extractionId));
  }

  private toDomain(row: TaskRow): Task {
    return Task.reconstitute({
      id: row.id,
      extractionId: row.extractionId,
      stepName: row.stepName as ExtractionStep,
      status: row.status as TaskStatusType,
      progress: row.progress,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      errorMessage: row.errorMessage,
      metadata: row.metadata,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
