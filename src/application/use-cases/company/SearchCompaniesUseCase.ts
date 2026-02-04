import type { IFinancialDataProvider } from "@/application/ports/IFinancialDataProvider";
import type {
  CompanySearchResponseDTO,
  CompanySearchResultDTO,
} from "@/application/dtos/company";
import type { SearchCompaniesInput } from "@/application/validators/schemas/companySchemas";

export class SearchCompaniesUseCase {
  constructor(private readonly financialDataProvider: IFinancialDataProvider) {}

  async execute(input: SearchCompaniesInput): Promise<CompanySearchResponseDTO> {
    const results = await this.financialDataProvider.searchCompanies(
      input.query,
      input.limit
    );

    const mappedResults: CompanySearchResultDTO[] = results.map((company) => ({
      symbol: company.symbol,
      name: company.name,
      exchange: company.exchange,
    }));

    return {
      results: mappedResults,
      query: input.query,
      count: mappedResults.length,
    };
  }
}
