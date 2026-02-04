import type { Report } from "../entities/Report";
import type {
  PaginationOptions,
  PaginatedResult,
} from "./IExtractionRepository";

export interface ReportFilters {
  companyId?: string;
  extractionId?: string;
}

export interface IReportRepository {
  findById(id: string): Promise<Report | null>;
  findByExtractionId(extractionId: string): Promise<Report | null>;
  findAll(
    filters?: ReportFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Report>>;
  save(report: Report): Promise<void>;
  update(report: Report): Promise<void>;
  delete(id: string): Promise<void>;
}
