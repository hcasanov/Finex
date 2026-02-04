import type { ITaskRepository } from "@/domain/repositories/ITaskRepository";
import type { IExtractionRepository } from "@/domain/repositories/IExtractionRepository";
import type { TaskProgressDTO } from "@/application/dtos/task";
import { STEP_LABELS, type ExtractionStepType } from "@/lib/constants";

export class ListTasksUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly extractionRepository: IExtractionRepository
  ) {}

  async execute(extractionId: string): Promise<TaskProgressDTO> {
    // Verify extraction exists (can be used for error handling later)
    await this.extractionRepository.findById(extractionId);
    const tasks = await this.taskRepository.findByExtractionId(extractionId);

    // Sort tasks by step order
    const stepOrder: ExtractionStepType[] = [
      "fetch_documents",
      "vectorize",
      "extract_data",
      "generate_report",
    ];

    const sortedTasks = tasks.sort(
      (a, b) =>
        stepOrder.indexOf(a.stepName as ExtractionStepType) -
        stepOrder.indexOf(b.stepName as ExtractionStepType)
    );

    // Find current step
    const currentTask = sortedTasks.find((t) => t.status === "processing");
    const currentStep = currentTask?.stepName ?? null;

    // Calculate overall progress
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const processingTask = tasks.find((t) => t.status === "processing");
    const processingProgress = processingTask
      ? processingTask.progress / 100 / tasks.length
      : 0;
    const overallProgress = Math.round(
      (completedTasks / tasks.length + processingProgress) * 100
    );

    // Check completion status
    const isCompleted = tasks.every((t) => t.status === "completed");
    const isFailed = tasks.some((t) => t.status === "failed");

    return {
      extractionId,
      tasks: sortedTasks.map((task) => ({
        id: task.id,
        extractionId: task.extractionId,
        stepName: task.stepName,
        stepLabel: STEP_LABELS[task.stepName as ExtractionStepType],
        status: task.status,
        progress: task.progress,
        startedAt: task.startedAt?.toISOString() ?? null,
        completedAt: task.completedAt?.toISOString() ?? null,
        errorMessage: task.errorMessage,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })),
      currentStep: currentStep as ExtractionStepType | null,
      overallProgress,
      isCompleted,
      isFailed,
    };
  }
}
