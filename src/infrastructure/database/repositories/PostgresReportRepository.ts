import { eq, and, desc, sql } from "drizzle-orm";
import type { Database } from "../connection";
import { reports, type ReportRow } from "../schema/reports";
import type {
  IReportRepository,
  ReportFilters,
} from "@/domain/repositories/IReportRepository";
import type {
  PaginationOptions,
  PaginatedResult,
} from "@/domain/repositories/IExtractionRepository";
import { Report } from "@/domain/entities/Report";

export class PostgresReportRepository implements IReportRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Report | null> {
    const rows = await this.db
      .select()
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    const row = rows[0];
    return row ? this.toDomain(row) : null;
  }

  async findByExtractionId(extractionId: string): Promise<Report | null> {
    const rows = await this.db
      .select()
      .from(reports)
      .where(eq(reports.extractionId, extractionId))
      .limit(1);

    const row = rows[0];
    return row ? this.toDomain(row) : null;
  }

  async findAll(
    filters?: ReportFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Report>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters?.companyId) {
      conditions.push(eq(reports.companyId, filters.companyId));
    }
    if (filters?.extractionId) {
      conditions.push(eq(reports.extractionId, filters.extractionId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(reports)
        .where(whereClause)
        .orderBy(desc(reports.generatedAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(reports)
        .where(whereClause),
    ]);

    const total = Number(countResult[0]?.count ?? 0);

    return {
      data: rows.map((row) => this.toDomain(row)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async save(report: Report): Promise<void> {
    await this.db.insert(reports).values({
      id: report.id,
      extractionId: report.extractionId,
      companyId: report.companyId,
      title: report.title,
      summary: report.summary,
      pdfUrl: report.pdfUrl,
      pdfSizeBytes: report.pdfSizeBytes,
      extractedMetrics: report.extractedMetrics,
      dataSources: report.dataSources,
      generatedAt: report.generatedAt,
      expiresAt: report.expiresAt,
      createdAt: report.createdAt,
    });
  }

  async update(report: Report): Promise<void> {
    await this.db
      .update(reports)
      .set({
        title: report.title,
        summary: report.summary,
        pdfUrl: report.pdfUrl,
        pdfSizeBytes: report.pdfSizeBytes,
        extractedMetrics: report.extractedMetrics,
        dataSources: report.dataSources,
      })
      .where(eq(reports.id, report.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(reports).where(eq(reports.id, id));
  }

  private toDomain(row: ReportRow): Report {
    return Report.reconstitute({
      id: row.id,
      extractionId: row.extractionId,
      companyId: row.companyId,
      title: row.title,
      summary: row.summary,
      pdfUrl: row.pdfUrl,
      pdfSizeBytes: row.pdfSizeBytes,
      extractedMetrics: row.extractedMetrics,
      dataSources: row.dataSources ?? [],
      generatedAt: row.generatedAt,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    });
  }
}
