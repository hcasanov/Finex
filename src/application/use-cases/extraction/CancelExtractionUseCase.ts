import type { IExtractionRepository } from "@/domain/repositories/IExtractionRepository";
import type { IQueueService } from "@/application/ports/IQueueService";
import type { CancelExtractionInput } from "@/application/validators/schemas/extractionSchemas";
import { ExtractionNotFoundError } from "@/domain/errors/ExtractionNotFoundError";

export class CancelExtractionUseCase {
  constructor(
    private readonly extractionRepository: IExtractionRepository,
    private readonly queueService: IQueueService
  ) {}

  async execute(input: CancelExtractionInput): Promise<{ success: boolean }> {
    const extraction = await this.extractionRepository.findById(input.id);

    if (!extraction) {
      throw new ExtractionNotFoundError(input.id);
    }

    if (!extraction.canCancel()) {
      return { success: false };
    }

    extraction.cancel();
    await this.extractionRepository.update(extraction);

    // Try to cancel the queue job
    await this.queueService.cancelJob(extraction.id);

    return { success: true };
  }
}
