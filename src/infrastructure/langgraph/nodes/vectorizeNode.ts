import type { ExtractionState, DocumentChunk } from "../state";
import type { IEmbeddingService } from "@/application/ports/IEmbeddingService";
import type { ITaskRepository } from "@/domain/repositories/ITaskRepository";

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

function splitIntoChunks(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }

  return chunks;
}

export function createVectorizeNode(
  embeddingService: IEmbeddingService,
  taskRepository: ITaskRepository
) {
  return async (state: ExtractionState): Promise<Partial<ExtractionState>> => {
    const { extractionId, documents } = state;

    // Update task status
    const tasks = await taskRepository.findByExtractionId(extractionId);
    const vectorizeTask = tasks.find((t) => t.stepName === "vectorize");
    if (vectorizeTask) {
      vectorizeTask.start();
      await taskRepository.update(vectorizeTask);
    }

    try {
      const allChunks: DocumentChunk[] = [];

      for (let docIndex = 0; docIndex < documents.length; docIndex++) {
        const doc = documents[docIndex];
        if (!doc) continue;

        // Split document into chunks
        const textChunks = splitIntoChunks(doc.content, CHUNK_SIZE, CHUNK_OVERLAP);

        // Generate embeddings for all chunks
        const embeddings = await embeddingService.embedBatch(textChunks);

        // Create document chunks with embeddings
        for (let i = 0; i < textChunks.length; i++) {
          const chunkContent = textChunks[i];
          if (!chunkContent) continue;

          const chunk: DocumentChunk = {
            id: `${doc.type}-${i}`,
            content: chunkContent,
            sourceType: doc.type,
            chunkIndex: i,
          };
          if (doc.url) {
            chunk.sourceUrl = doc.url;
          }
          const embedding = embeddings[i];
          if (embedding) {
            chunk.embedding = embedding;
          }
          allChunks.push(chunk);
        }

        // Update progress
        if (vectorizeTask) {
          const progress = Math.round(((docIndex + 1) / documents.length) * 100);
          vectorizeTask.updateProgress(progress);
          await taskRepository.update(vectorizeTask);
        }
      }

      // Mark task as completed
      if (vectorizeTask) {
        vectorizeTask.complete();
        await taskRepository.update(vectorizeTask);
      }

      return {
        chunks: allChunks,
        currentStep: "extract_data",
      };
    } catch (error) {
      if (vectorizeTask) {
        vectorizeTask.fail(error instanceof Error ? error.message : "Unknown error");
        await taskRepository.update(vectorizeTask);
      }

      return {
        error: error instanceof Error ? error.message : "Failed to vectorize documents",
        currentStep: "error",
      };
    }
  };
}
