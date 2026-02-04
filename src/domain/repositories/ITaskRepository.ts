import type { Task, ExtractionStep } from "../entities/Task";
import type { TaskStatusType } from "../value-objects/TaskStatus";

export interface TaskFilters {
  extractionId?: string;
  status?: TaskStatusType;
  stepName?: ExtractionStep;
}

export interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  findByExtractionId(extractionId: string): Promise<Task[]>;
  findByExtractionAndStep(
    extractionId: string,
    stepName: ExtractionStep
  ): Promise<Task | null>;
  findAll(filters?: TaskFilters): Promise<Task[]>;
  save(task: Task): Promise<void>;
  saveMany(tasks: Task[]): Promise<void>;
  update(task: Task): Promise<void>;
  updateByExtractionAndStep(
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
  ): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByExtractionId(extractionId: string): Promise<void>;
}
