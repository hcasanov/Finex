import type { TaskStatusType } from "@/domain/value-objects/TaskStatus";
import type { ExtractionStep } from "@/domain/entities/Task";

export interface TaskDTO {
  id: string;
  extractionId: string;
  stepName: ExtractionStep;
  stepLabel: string;
  status: TaskStatusType;
  progress: number;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskProgressDTO {
  extractionId: string;
  tasks: TaskDTO[];
  currentStep: ExtractionStep | null;
  overallProgress: number;
  isCompleted: boolean;
  isFailed: boolean;
}

export interface TaskListResponseDTO {
  tasks: TaskDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
