import type { IReportRepository } from "@/domain/repositories/IReportRepository";
import type { ReportListResponseDTO } from "@/application/dtos/report";
import type { ListReportsInput } from "@/application/validators/schemas/reportSchemas";

export class ListReportsUseCase {
  constructor(private readonly reportRepository: IReportRepository) {}

  async execute(input: ListReportsInput): Promise<ReportListResponseDTO> {
    const filters: { companyId?: string } = {};
    if (input.companyId !== undefined) {
      filters.companyId = input.companyId;
    }

    const result = await this.reportRepository.findAll(
      filters,
      {
        page: input.page,
        limit: input.limit,
      }
    );

    return {
      reports: result.data.map((report) => ({
        id: report.id,
        extractionId: report.extractionId,
        companyId: report.companyId,
        title: report.title,
        summary: report.summary,
        hasPdf: report.hasPdf(),
        metricsCount: report.extractedMetrics.length,
        generatedAt: report.generatedAt.toISOString(),
        createdAt: report.createdAt.toISOString(),
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
