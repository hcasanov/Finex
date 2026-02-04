import type { IExtractionRepository } from "@/domain/repositories/IExtractionRepository";
import type { ITaskRepository } from "@/domain/repositories/ITaskRepository";
import type { ExtractionWithTasksDTO } from "@/application/dtos/extraction";
import type { GetExtractionInput } from "@/application/validators/schemas/extractionSchemas";
import { ExtractionNotFoundError } from "@/domain/errors/ExtractionNotFoundError";
import { STEP_LABELS } from "@/lib/constants";
import type { ExtractionStep } from "@/domain/entities/Task";

export class GetExtractionStatusUseCase {
  constructor(
    private readonly extractionRepository: IExtractionRepository,
    private readonly taskRepository: ITaskRepository
  ) {}

  async execute(input: GetExtractionInput): Promise<ExtractionWithTasksDTO> {
    const extraction = await this.extractionRepository.findById(input.id);

    if (!extraction) {
      throw new ExtractionNotFoundError(input.id);
    }

    const tasks = await this.taskRepository.findByExtractionId(extraction.id);

    // Calculate overall progress
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const totalTasks = tasks.length;
    const overallProgress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      id: extraction.id,
      companyId: extraction.companyId,
      symbol: extraction.symbol.toString(),
      fiscalYear: extraction.fiscalYear,
      requestedMetrics: extraction.requestedMetrics,
      status: extraction.status,
      errorMessage: extraction.errorMessage,
      createdAt: extraction.createdAt.toISOString(),
      updatedAt: extraction.updatedAt.toISOString(),
      tasks: tasks.map((task) => ({
        id: task.id,
        stepName: task.stepName,
        stepLabel: STEP_LABELS[task.stepName as ExtractionStep],
        status: task.status,
        progress: task.progress,
        startedAt: task.startedAt?.toISOString() ?? null,
        completedAt: task.completedAt?.toISOString() ?? null,
        errorMessage: task.errorMessage,
      })),
      overallProgress,
    };
  }
}
