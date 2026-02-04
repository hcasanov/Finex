import type { Company } from "../entities/Company";
import type { Symbol } from "../value-objects/Symbol";

export interface ICompanyRepository {
  findById(id: string): Promise<Company | null>;
  findBySymbol(symbol: Symbol): Promise<Company | null>;
  findBySymbolString(symbol: string): Promise<Company | null>;
  search(query: string, limit?: number): Promise<Company[]>;
  save(company: Company): Promise<void>;
  update(company: Company): Promise<void>;
  delete(id: string): Promise<void>;
}
