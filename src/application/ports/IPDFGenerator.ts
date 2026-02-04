import type { ExtractedMetric } from "@/domain/entities/Report";

export interface PDFReportData {
  companyName: string;
  companySymbol: string;
  fiscalYear: number;
  metrics: ExtractedMetric[];
  summary: string | null;
  dataSources: string[];
  generatedAt: Date;
}

export interface IPDFGenerator {
  generate(data: PDFReportData): Promise<Buffer>;
}
