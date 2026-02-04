import { DomainError } from "./DomainError";

export class CompanyNotFoundError extends DomainError {
  readonly symbol: string;

  constructor(symbol: string) {
    super(`Company with symbol "${symbol}" was not found.`, "COMPANY_NOT_FOUND");
    this.symbol = symbol;
  }
}
