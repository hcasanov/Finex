import type { IExtractionRepository } from "@/domain/repositories/IExtractionRepository";
import type { ExtractionListResponseDTO } from "@/application/dtos/extraction";
import type { ListExtractionsInput } from "@/application/validators/schemas/extractionSchemas";
import type { TaskStatusType } from "@/domain/value-objects/TaskStatus";

export class ListExtractionsUseCase {
  constructor(private readonly extractionRepository: IExtractionRepository) {}

  async execute(input: ListExtractionsInput): Promise<ExtractionListResponseDTO> {
    const filters: { status?: TaskStatusType; companyId?: string } = {};
    if (input.status !== undefined) {
      filters.status = input.status as TaskStatusType;
    }
    if (input.companyId !== undefined) {
      filters.companyId = input.companyId;
    }

    const result = await this.extractionRepository.findAll(
      filters,
      {
        page: input.page,
        limit: input.limit,
      }
    );

    return {
      extractions: result.data.map((extraction) => ({
        id: extraction.id,
        companyId: extraction.companyId,
        symbol: extraction.symbol.toString(),
        fiscalYear: extraction.fiscalYear,
        requestedMetrics: extraction.requestedMetrics,
        status: extraction.status,
        errorMessage: extraction.errorMessage,
        createdAt: extraction.createdAt.toISOString(),
        updatedAt: extraction.updatedAt.toISOString(),
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
