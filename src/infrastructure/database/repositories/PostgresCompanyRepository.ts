import { eq, ilike, or } from "drizzle-orm";
import type { Database } from "../connection";
import { companies, type CompanyRow } from "../schema/companies";
import type { ICompanyRepository } from "@/domain/repositories/ICompanyRepository";
import { Company } from "@/domain/entities/Company";
import { Symbol } from "@/domain/value-objects/Symbol";

export class PostgresCompanyRepository implements ICompanyRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Company | null> {
    const rows = await this.db
      .select()
      .from(companies)
      .where(eq(companies.id, id))
      .limit(1);

    const row = rows[0];
    return row ? this.toDomain(row) : null;
  }

  async findBySymbol(symbol: Symbol): Promise<Company | null> {
    return this.findBySymbolString(symbol.toString());
  }

  async findBySymbolString(symbol: string): Promise<Company | null> {
    const rows = await this.db
      .select()
      .from(companies)
      .where(eq(companies.symbol, symbol.toUpperCase()))
      .limit(1);

    const row = rows[0];
    return row ? this.toDomain(row) : null;
  }

  async search(query: string, limit = 10): Promise<Company[]> {
    const searchPattern = `%${query}%`;

    const rows = await this.db
      .select()
      .from(companies)
      .where(
        or(
          ilike(companies.symbol, searchPattern),
          ilike(companies.name, searchPattern)
        )
      )
      .limit(limit);

    return rows.map((row) => this.toDomain(row));
  }

  async save(company: Company): Promise<void> {
    await this.db.insert(companies).values({
      id: company.id,
      symbol: company.symbol.toString(),
      name: company.name,
      exchange: company.exchange,
      sector: company.sector,
      industry: company.industry,
      country: company.country,
      marketCap: company.marketCap?.toString() ?? null,
      logoUrl: company.logoUrl,
      website: company.website,
      description: company.description,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    });
  }

  async update(company: Company): Promise<void> {
    await this.db
      .update(companies)
      .set({
        name: company.name,
        exchange: company.exchange,
        sector: company.sector,
        industry: company.industry,
        country: company.country,
        marketCap: company.marketCap?.toString() ?? null,
        logoUrl: company.logoUrl,
        website: company.website,
        description: company.description,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, company.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(companies).where(eq(companies.id, id));
  }

  private toDomain(row: CompanyRow): Company {
    return Company.reconstitute({
      id: row.id,
      symbol: Symbol.create(row.symbol),
      name: row.name,
      exchange: row.exchange,
      sector: row.sector,
      industry: row.industry,
      country: row.country,
      marketCap: row.marketCap ? parseFloat(row.marketCap) : null,
      logoUrl: row.logoUrl,
      website: row.website,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
