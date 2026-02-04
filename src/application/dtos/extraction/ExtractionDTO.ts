import type { TaskStatusType } from "@/domain/value-objects/TaskStatus";

export interface CreateExtractionRequestDTO {
  symbol: string;
  fiscalYear: number;
  metrics: string[];
}

export interface ExtractionDTO {
  id: string;
  companyId: string;
  symbol: string;
  fiscalYear: number;
  requestedMetrics: string[];
  status: TaskStatusType;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractionWithTasksDTO extends ExtractionDTO {
  tasks: Array<{
    id: string;
    stepName: string;
    status: TaskStatusType;
    progress: number;
    startedAt: string | null;
    completedAt: string | null;
    errorMessage: string | null;
  }>;
  overallProgress: number;
}

export interface ExtractionListResponseDTO {
  extractions: ExtractionDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
