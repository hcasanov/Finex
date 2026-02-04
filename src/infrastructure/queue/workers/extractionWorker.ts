import { runExtractionWorkflow } from "@/infrastructure/langgraph";
import type { WorkflowDependencies } from "@/infrastructure/langgraph";
import type { IExtractionRepository } from "@/domain/repositories/IExtractionRepository";

export interface ExtractionJobData {
  extractionId: string;
  companyId: string;
  companyName: string;
  symbol: string;
  fiscalYear: number;
  requestedMetrics: string[];
}

export interface ExtractionWorkerDependencies extends WorkflowDependencies {
  extractionRepository: IExtractionRepository;
}

export async function processExtractionJob(
  data: ExtractionJobData,
  deps: ExtractionWorkerDependencies
): Promise<void> {
  const { extractionRepository, ...workflowDeps } = deps;

  // Get extraction and mark as processing
  const extraction = await extractionRepository.findById(data.extractionId);
  if (!extraction) {
    throw new Error(`Extraction not found: ${data.extractionId}`);
  }

  extraction.markAsProcessing();
  await extractionRepository.update(extraction);

  try {
    // Run the workflow
    const result = await runExtractionWorkflow(workflowDeps, {
      extractionId: data.extractionId,
      companyId: data.companyId,
      companyName: data.companyName,
      symbol: data.symbol,
      fiscalYear: data.fiscalYear,
      requestedMetrics: data.requestedMetrics,
    });

    if (result.error) {
      extraction.markAsFailed(result.error);
    } else {
      extraction.markAsCompleted();
    }

    await extractionRepository.update(extraction);
  } catch (error) {
    extraction.markAsFailed(error instanceof Error ? error.message : "Unknown error");
    await extractionRepository.update(extraction);
    throw error;
  }
}
