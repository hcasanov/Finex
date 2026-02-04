export interface MetricExtractionRequest {
  metricCode: string;
  metricName: string;
  companyName: string;
  fiscalYear: number;
  context: string;
}

export interface MetricExtractionResult {
  found: boolean;
  value: number | null;
  unit: "currency" | "percentage" | "ratio" | "number";
  period: string;
  source: string | null;
  confidence: number;
  reasoning: string;
}

export interface SummaryGenerationRequest {
  companyName: string;
  fiscalYear: number;
  metrics: Array<{
    name: string;
    value: number | null;
    unit: string;
  }>;
}

export interface ILLMService {
  extractMetric(request: MetricExtractionRequest): Promise<MetricExtractionResult>;
  extractMetricsBatch(
    requests: MetricExtractionRequest[]
  ): Promise<MetricExtractionResult[]>;
  generateSummary(request: SummaryGenerationRequest): Promise<string>;
}
