import type { IReportRepository } from "@/domain/repositories/IReportRepository";
import type { ReportDetailsDTO } from "@/application/dtos/report";
import { ReportNotFoundError } from "@/domain/errors/ReportNotFoundError";
import { FINANCIAL_METRICS } from "@/lib/constants";
import type { ExtractedMetric } from "@/domain/entities/Report";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export class GetReportByExtractionUseCase {
  constructor(private readonly reportRepository: IReportRepository) {}

  async execute(extractionId: string): Promise<ReportDetailsDTO> {
    const report = await this.reportRepository.findByExtractionId(extractionId);

    if (!report) {
      throw new ReportNotFoundError(`extraction:${extractionId}`);
    }

    // Group metrics by category
    const metricsByCategory: Record<string, ExtractedMetric[]> = {};

    for (const metric of report.extractedMetrics) {
      const definition = FINANCIAL_METRICS.find((m) => m.code === metric.code);
      const category = definition?.category ?? "other";

      if (!metricsByCategory[category]) {
        metricsByCategory[category] = [];
      }
      metricsByCategory[category].push(metric);
    }

    return {
      id: report.id,
      extractionId: report.extractionId,
      companyId: report.companyId,
      title: report.title,
      summary: report.summary,
      pdfUrl: report.pdfUrl,
      pdfSizeBytes: report.pdfSizeBytes,
      pdfSizeFormatted: report.pdfSizeBytes
        ? formatBytes(report.pdfSizeBytes)
        : null,
      extractedMetrics: report.extractedMetrics,
      metricsByCategory,
      dataSources: report.dataSources,
      generatedAt: report.generatedAt.toISOString(),
      expiresAt: report.expiresAt?.toISOString() ?? null,
      createdAt: report.createdAt.toISOString(),
    };
  }
}
