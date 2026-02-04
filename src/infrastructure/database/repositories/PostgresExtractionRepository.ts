import { eq, and, desc, sql } from "drizzle-orm";
import type { Database } from "../connection";
import { extractions, type ExtractionRow } from "../schema/extractions";
import type {
  IExtractionRepository,
  ExtractionFilters,
  PaginationOptions,
  PaginatedResult,
} from "@/domain/repositories/IExtractionRepository";
import { Extraction } from "@/domain/entities/Extraction";
import { Symbol } from "@/domain/value-objects/Symbol";
import type { TaskStatusType } from "@/domain/value-objects/TaskStatus";

export class PostgresExtractionRepository implements IExtractionRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Extraction | null> {
    const rows = await this.db
      .select()
      .from(extractions)
      .where(eq(extractions.id, id))
      .limit(1);

    const row = rows[0];
    return row ? this.toDomain(row) : null;
  }

  async findByCompanyId(companyId: string): Promise<Extraction[]> {
    const rows = await this.db
      .select()
      .from(extractions)
      .where(eq(extractions.companyId, companyId))
      .orderBy(desc(extractions.createdAt));

    return rows.map((row) => this.toDomain(row));
  }

  async findAll(
    filters?: ExtractionFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Extraction>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters?.companyId) {
      conditions.push(eq(extractions.companyId, filters.companyId));
    }
    if (filters?.status) {
      conditions.push(eq(extractions.status, filters.status));
    }
    if (filters?.fiscalYear) {
      conditions.push(eq(extractions.fiscalYear, filters.fiscalYear));
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(extractions)
        .where(whereClause)
        .orderBy(desc(extractions.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(extractions)
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

  async save(extraction: Extraction): Promise<void> {
    await this.db.insert(extractions).values({
      id: extraction.id,
      companyId: extraction.companyId,
      symbol: extraction.symbol.toString(),
      fiscalYear: extraction.fiscalYear,
      requestedMetrics: extraction.requestedMetrics,
      status: extraction.status,
      errorMessage: extraction.errorMessage,
      createdAt: extraction.createdAt,
      updatedAt: extraction.updatedAt,
    });
  }

  async update(extraction: Extraction): Promise<void> {
    await this.db
      .update(extractions)
      .set({
        status: extraction.status,
        errorMessage: extraction.errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(extractions.id, extraction.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(extractions).where(eq(extractions.id, id));
  }

  private toDomain(row: ExtractionRow): Extraction {
    return Extraction.reconstitute({
      id: row.id,
      companyId: row.companyId,
      symbol: Symbol.create(row.symbol),
      fiscalYear: row.fiscalYear,
      requestedMetrics: row.requestedMetrics,
      status: row.status as TaskStatusType,
      errorMessage: row.errorMessage,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
