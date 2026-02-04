import { google } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import type {
  ILLMService,
  MetricExtractionRequest,
  MetricExtractionResult,
  SummaryGenerationRequest,
} from "@/application/ports/ILLMService";

const metricExtractionSchema = z.object({
  found: z.boolean().describe("Whether the metric was found in the context"),
  value: z.number().nullable().describe("The extracted numeric value, or null if not found"),
  unit: z.enum(["currency", "percentage", "ratio", "number"]).describe("The unit of the value"),
  period: z.string().describe("The fiscal period (e.g., 'FY2023', 'Q4 2023')"),
  source: z.string().nullable().describe("The source document or section where the value was found"),
  confidence: z.number().min(0).max(1).describe("Confidence score from 0 to 1"),
  reasoning: z.string().describe("Brief explanation of how the value was extracted"),
});

export class GeminiLLMService implements ILLMService {
  private readonly model;

  constructor() {
    this.model = google("gemini-1.5-flash");
  }

  async extractMetric(request: MetricExtractionRequest): Promise<MetricExtractionResult> {
    const prompt = `You are a financial analyst extracting specific metrics from financial documents.

Company: ${request.companyName}
Fiscal Year: ${request.fiscalYear}
Metric to extract: ${request.metricName} (code: ${request.metricCode})

Context from financial documents:
${request.context}

Extract the ${request.metricName} for fiscal year ${request.fiscalYear}.
If the exact value is not available, indicate that it was not found.
For currency values, use the raw number (e.g., 394328000000 for $394.328 billion).
For percentages, use decimal form (e.g., 0.15 for 15%).`;

    const { object } = await generateObject({
      model: this.model,
      schema: metricExtractionSchema,
      prompt,
    });

    return object;
  }

  async extractMetricsBatch(
    requests: MetricExtractionRequest[]
  ): Promise<MetricExtractionResult[]> {
    // Process in parallel with concurrency limit
    const results: MetricExtractionResult[] = [];
    const concurrencyLimit = 5;

    for (let i = 0; i < requests.length; i += concurrencyLimit) {
      const batch = requests.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(
        batch.map((req) => this.extractMetric(req))
      );
      results.push(...batchResults);
    }

    return results;
  }

  async generateSummary(request: SummaryGenerationRequest): Promise<string> {
    const metricsText = request.metrics
      .map((m) => {
        const valueStr =
          m.value !== null
            ? m.unit === "currency"
              ? `$${(m.value / 1e9).toFixed(2)}B`
              : m.unit === "percentage"
              ? `${(m.value * 100).toFixed(2)}%`
              : m.value.toFixed(2)
            : "N/A";
        return `- ${m.name}: ${valueStr}`;
      })
      .join("\n");

    const prompt = `You are a financial analyst writing an executive summary.

Company: ${request.companyName}
Fiscal Year: ${request.fiscalYear}

Extracted Financial Metrics:
${metricsText}

Write a brief (2-3 paragraphs) executive summary highlighting the key financial performance indicators.
Focus on the most significant metrics and any notable trends or observations.
Keep the tone professional and objective.`;

    const { text } = await generateText({
      model: this.model,
      prompt,
    });

    return text;
  }
}
