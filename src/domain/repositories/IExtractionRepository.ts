import type { Extraction } from "../entities/Extraction";
import type { TaskStatusType } from "../value-objects/TaskStatus";

export interface ExtractionFilters {
  companyId?: string;
  status?: TaskStatusType;
  fiscalYear?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IExtractionRepository {
  findById(id: string): Promise<Extraction | null>;
  findByCompanyId(companyId: string): Promise<Extraction[]>;
  findAll(
    filters?: ExtractionFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Extraction>>;
  save(extraction: Extraction): Promise<void>;
  update(extraction: Extraction): Promise<void>;
  delete(id: string): Promise<void>;
}
