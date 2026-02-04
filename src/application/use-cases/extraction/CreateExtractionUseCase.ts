import type { ICompanyRepository } from "@/domain/repositories/ICompanyRepository";
import type { IExtractionRepository } from "@/domain/repositories/IExtractionRepository";
import type { ITaskRepository } from "@/domain/repositories/ITaskRepository";
import type { IQueueService } from "@/application/ports/IQueueService";
import type { IFinancialDataProvider } from "@/application/ports/IFinancialDataProvider";
import type { ExtractionDTO } from "@/application/dtos/extraction";
import type { CreateExtractionInput } from "@/application/validators/schemas/extractionSchemas";
import { Extraction } from "@/domain/entities/Extraction";
import { Task, type ExtractionStep } from "@/domain/entities/Task";
import { Company } from "@/domain/entities/Company";
import { Symbol } from "@/domain/value-objects/Symbol";
import { CompanyNotFoundError } from "@/domain/errors/CompanyNotFoundError";

const EXTRACTION_STEPS: ExtractionStep[] = [
  "fetch_documents",
  "vectorize",
  "extract_data",
  "generate_report",
];

export class CreateExtractionUseCase {
  constructor(
    private readonly companyRepository: ICompanyRepository,
    private readonly extractionRepository: IExtractionRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly queueService: IQueueService,
    private readonly financialDataProvider: IFinancialDataProvider
  ) {}

  async execute(input: CreateExtractionInput): Promise<ExtractionDTO> {
    const symbol = Symbol.create(input.symbol);

    // Get or create company
    let company = await this.companyRepository.findBySymbol(symbol);

    if (!company) {
      const profile = await this.financialDataProvider.getCompanyProfile(
        input.symbol
      );

      if (!profile) {
        throw new CompanyNotFoundError(input.symbol);
      }

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

    // Create extraction
    const extraction = Extraction.create({
      companyId: company.id,
      symbol: input.symbol,
      fiscalYear: input.fiscalYear,
      requestedMetrics: input.metrics,
    });

    await this.extractionRepository.save(extraction);

    // Create tasks for each step
    const tasks = EXTRACTION_STEPS.map((stepName) =>
      Task.create({
        extractionId: extraction.id,
        stepName,
      })
    );

    await this.taskRepository.saveMany(tasks);

    // Enqueue job
    await this.queueService.enqueue("extraction", {
      extractionId: extraction.id,
      companyId: company.id,
      companySymbol: company.symbol.toString(),
      companyName: company.name,
      fiscalYear: input.fiscalYear,
      requestedMetrics: input.metrics,
    });

    return {
      id: extraction.id,
      companyId: extraction.companyId,
      symbol: extraction.symbol.toString(),
      fiscalYear: extraction.fiscalYear,
      requestedMetrics: extraction.requestedMetrics,
      status: extraction.status,
      errorMessage: extraction.errorMessage,
      createdAt: extraction.createdAt.toISOString(),
      updatedAt: extraction.updatedAt.toISOString(),
    };
  }
}
