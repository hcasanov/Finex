import type { ExtractedMetric } from "@/domain/entities/Report";

export interface ReportSummaryDTO {
  id: string;
  extractionId: string;
  companyId: string;
  title: string;
  summary: string | null;
  hasPdf: boolean;
  metricsCount: number;
  generatedAt: string;
  createdAt: string;
}

export interface ReportDetailsDTO {
  id: string;
  extractionId: string;
  companyId: string;
  title: string;
  summary: string | null;
  pdfUrl: string | null;
  pdfSizeBytes: number | null;
  pdfSizeFormatted: string | null;
  extractedMetrics: ExtractedMetric[];
  metricsByCategory: Record<string, ExtractedMetric[]>;
  dataSources: string[];
  generatedAt: string;
  expiresAt: string | null;
  createdAt: string;
}

export interface ReportListResponseDTO {
  reports: ReportSummaryDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
