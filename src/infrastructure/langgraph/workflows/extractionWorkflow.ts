import { type ExtractionState, createInitialState } from "../state";
import {
  createFetchDocumentsNode,
  createVectorizeNode,
  createExtractDataNode,
  createGenerateReportNode,
} from "../nodes";
import type { IFinancialDataProvider } from "@/application/ports/IFinancialDataProvider";
import type { IEmbeddingService } from "@/application/ports/IEmbeddingService";
import type { ILLMService } from "@/application/ports/ILLMService";
import type { IStorageService } from "@/application/ports/IStorageService";
import type { IPDFGenerator } from "@/application/ports/IPDFGenerator";
import type { ITaskRepository } from "@/domain/repositories/ITaskRepository";
import type { IReportRepository } from "@/domain/repositories/IReportRepository";

export interface WorkflowDependencies {
  financialDataProvider: IFinancialDataProvider;
  embeddingService: IEmbeddingService;
  llmService: ILLMService;
  storageService: IStorageService;
  pdfGenerator: IPDFGenerator;
  taskRepository: ITaskRepository;
  reportRepository: IReportRepository;
}

export interface WorkflowInput {
  extractionId: string;
  companyId: string;
  companyName: string;
  symbol: string;
  fiscalYear: number;
  requestedMetrics: string[];
}

type WorkflowNode = (state: ExtractionState) => Promise<Partial<ExtractionState>>;

export async function runExtractionWorkflow(
  deps: WorkflowDependencies,
  input: WorkflowInput
): Promise<ExtractionState> {
  const {
    financialDataProvider,
    embeddingService,
    llmService,
    storageService,
    pdfGenerator,
    taskRepository,
    reportRepository,
  } = deps;

  // Create nodes
  const nodes: Record<string, WorkflowNode> = {
    fetch_documents: createFetchDocumentsNode(financialDataProvider, taskRepository),
    vectorize: createVectorizeNode(embeddingService, taskRepository),
    extract_data: createExtractDataNode(llmService, embeddingService, taskRepository),
    generate_report: createGenerateReportNode(
      llmService,
      storageService,
      pdfGenerator,
      taskRepository,
      reportRepository
    ),
  };

  // Initialize state
  let state: ExtractionState = createInitialState(input);

  // Simple workflow execution loop
  const maxIterations = 10;
  let iteration = 0;

  while (
    state.currentStep !== "completed" &&
    state.currentStep !== "error" &&
    iteration < maxIterations
  ) {
    const node = nodes[state.currentStep];
    if (!node) {
      state = {
        ...state,
        error: `Unknown step: ${state.currentStep}`,
        currentStep: "error",
      };
      break;
    }

    const updates = await node(state);
    state = { ...state, ...updates };
    iteration++;
  }

  if (iteration >= maxIterations) {
    state = {
      ...state,
      error: "Workflow exceeded maximum iterations",
      currentStep: "error",
    };
  }

  return state;
}
