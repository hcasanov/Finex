import type { IFinancialDataProvider } from "@/application/ports/IFinancialDataProvider";
import type { ICompanyRepository } from "@/domain/repositories/ICompanyRepository";
import type { CompanyDetailsDTO } from "@/application/dtos/company";
import type { GetCompanyInput } from "@/application/validators/schemas/companySchemas";
import { Company } from "@/domain/entities/Company";
import { Symbol } from "@/domain/value-objects/Symbol";
import { CompanyNotFoundError } from "@/domain/errors/CompanyNotFoundError";
import { formatCurrency } from "@/lib/utils";

export class GetCompanyDetailsUseCase {
  constructor(
    private readonly companyRepository: ICompanyRepository,
    private readonly financialDataProvider: IFinancialDataProvider
  ) {}

  async execute(input: GetCompanyInput): Promise<CompanyDetailsDTO> {
    const symbol = Symbol.create(input.symbol);

    // Try to find in cache first
    let company = await this.companyRepository.findBySymbol(symbol);

    if (!company) {
      // Fetch from external API
      const profile = await this.financialDataProvider.getCompanyProfile(
        input.symbol
      );

      if (!profile) {
        throw new CompanyNotFoundError(input.symbol);
      }

      // Create and save the company
      company = Company.create({
        symbol: profile.symbol,
        name: profile.name,
        exchange: profile.exchange,
        sector: profile.sector,
        industry: profile.industry,
        country: profile.country,
        marketCap: profile.marketCap,
        logoUrl: profile.logoUrl,
        website: profile.website,
        description: profile.description,
      });

      await this.companyRepository.save(company);
    }

    return {
      id: company.id,
      symbol: company.symbol.toString(),
      name: company.name,
      exchange: company.exchange,
      sector: company.sector,
      industry: company.industry,
      country: company.country,
      marketCap: company.marketCap,
      marketCapFormatted: company.marketCap
        ? formatCurrency(company.marketCap, "USD", true)
        : null,
      logoUrl: company.logoUrl,
      website: company.website,
      description: company.description,
    };
  }
}
