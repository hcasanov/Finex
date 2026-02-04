import { google } from "@ai-sdk/google";
import { embedMany, embed } from "ai";
import type { IEmbeddingService } from "@/application/ports/IEmbeddingService";

export class GeminiEmbeddingService implements IEmbeddingService {
  private readonly model;
  private readonly dimension = 768; // text-embedding-004 dimension

  constructor() {
    this.model = google.textEmbeddingModel("text-embedding-004");
  }

  async embed(text: string): Promise<number[]> {
    const { embedding } = await embed({
      model: this.model,
      value: text,
    });

    return embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    const { embeddings } = await embedMany({
      model: this.model,
      values: texts,
    });

    return embeddings;
  }

  getDimension(): number {
    return this.dimension;
  }
}
