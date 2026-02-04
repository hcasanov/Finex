import type { ExtractionState } from "../state";
import type { ILLMService } from "@/application/ports/ILLMService";
import type { IEmbeddingService } from "@/application/ports/IEmbeddingService";
import type { ITaskRepository } from "@/domain/repositories/ITaskRepository";
import type { ExtractedMetric } from "@/domain/entities/Report";
import { FINANCIAL_METRICS } from "@/lib/constants";

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dotProduct += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function createExtractDataNode(
  llmService: ILLMService,
  embeddingService: IEmbeddingService,
  taskRepository: ITaskRepository
) {
  return async (state: ExtractionState): Promise<Partial<ExtractionState>> => {
    const { extractionId, companyName, symbol, fiscalYear, requestedMetrics, chunks } = state;

    // Update task status
    const tasks = await taskRepository.findByExtractionId(extractionId);
    const extractTask = tasks.find((t) => t.stepName === "extract_data");
    if (extractTask) {
      extractTask.start();
      await taskRepository.update(extractTask);
    }

    try {
      const extractedMetrics: ExtractedMetric[] = [];

      for (let i = 0; i < requestedMetrics.length; i++) {
        const metricCode = requestedMetrics[i];
        if (!metricCode) continue;

        const metricDef = FINANCIAL_METRICS.find((m) => m.code === metricCode);
        if (!metricDef) continue;

        // Create query for this metric
        const query = `${metricDef.name} for ${symbol} fiscal year ${fiscalYear}`;

        // Get query embedding
        const queryEmbedding = await embeddingService.embed(query);

        // Find most relevant chunks using cosine similarity
        const rankedChunks = chunks
          .filter((chunk) => chunk.embedding !== undefined)
          .map((chunk) => ({
            chunk,
            similarity: cosineSimilarity(queryEmbedding, chunk.embedding!),
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 3);

        // Build context from top chunks
        const context = rankedChunks.map((r) => r.chunk.content).join("\n\n");

        // Extract metric using LLM
        const result = await llmService.extractMetric({
          metricCode,
          metricName: metricDef.name,
          companyName: companyName || symbol,
          fiscalYear,
          context,
        });

        extractedMetrics.push({
          code: metricCode,
          name: metricDef.name,
          value: result.value,
          unit: metricDef.unit,
          period: result.period || `FY${fiscalYear}`,
          confidence: result.confidence,
          source: result.source ?? null,
        });

        // Update progress
        if (extractTask) {
          const progress = Math.round(((i + 1) / requestedMetrics.length) * 100);
          extractTask.updateProgress(progress);
          await taskRepository.update(extractTask);
        }
      }

      // Check if we have enough high-confidence metrics
      const highConfidenceCount = extractedMetrics.filter(
        (m) => m.confidence >= 0.7
      ).length;
      const confidenceRatio = highConfidenceCount / extractedMetrics.length;

      // Retry if too many low-confidence results and haven't retried yet
      if (confidenceRatio < 0.5 && state.retryCount < 2) {
        return {
          retryCount: state.retryCount + 1,
          currentStep: "fetch_documents",
        };
      }

      // Mark task as completed
      if (extractTask) {
        extractTask.complete();
        await taskRepository.update(extractTask);
      }

      return {
        extractedMetrics,
        currentStep: "generate_report",
      };
    } catch (error) {
      if (extractTask) {
        extractTask.fail(error instanceof Error ? error.message : "Unknown error");
        await taskRepository.update(extractTask);
      }

      return {
        error: error instanceof Error ? error.message : "Failed to extract data",
        currentStep: "error",
      };
    }
  };
}
