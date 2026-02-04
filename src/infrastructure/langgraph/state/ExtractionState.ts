import type { ExtractedMetric } from "@/domain/entities/Report";

export interface DocumentChunk {
  id: string;
  content: string;
  sourceType: string;
  sourceUrl?: string;
  chunkIndex: number;
  embedding?: number[];
}

export interface FetchedDocument {
  type: string;
  content: string;
  url?: string;
  fiscalYear: number;
  period?: string;
}

export interface ExtractionState {
  // Input
  extractionId: string;
  companyId: string;
  companyName: string;
  symbol: string;
  fiscalYear: number;
  requestedMetrics: string[];

  // Workflow state
  currentStep: "fetch_documents" | "vectorize" | "extract_data" | "generate_report" | "completed" | "error";
  retryCount: number;

  // Fetched documents
  documents: FetchedDocument[];

  // Vectorized chunks
  chunks: DocumentChunk[];

  // Extracted metrics
  extractedMetrics: ExtractedMetric[];

  // Report generation
  reportId: string | null;
  pdfUrl: string | null;

  // Error handling
  error: string | null;
  isCompleted: boolean;
}

export function createInitialState(input: {
  extractionId: string;
  companyId: string;
  companyName: string;
  symbol: string;
  fiscalYear: number;
  requestedMetrics: string[];
}): ExtractionState {
  return {
    ...input,
    currentStep: "fetch_documents",
    retryCount: 0,
    documents: [],
    chunks: [],
    extractedMetrics: [],
    reportId: null,
    pdfUrl: null,
    error: null,
    isCompleted: false,
  };
}
