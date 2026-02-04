export interface DocumentChunk {
  id: string;
  extractionId: string;
  companyId: string;
  content: string;
  sourceType: string;
  sourceUrl: string | null;
  sourceDate: Date | null;
  chunkIndex: number;
  metadata: Record<string, unknown> | null;
}

export interface DocumentChunkWithEmbedding extends DocumentChunk {
  embedding: number[];
}

export interface SimilaritySearchOptions {
  extractionId?: string;
  companyId?: string;
  limit?: number;
  threshold?: number;
}

export interface SimilaritySearchResult {
  chunk: DocumentChunk;
  score: number;
}

export interface IVectorStore {
  upsert(chunk: DocumentChunkWithEmbedding): Promise<void>;
  upsertMany(chunks: DocumentChunkWithEmbedding[]): Promise<void>;
  similaritySearch(
    queryEmbedding: number[],
    options?: SimilaritySearchOptions
  ): Promise<SimilaritySearchResult[]>;
  deleteByExtractionId(extractionId: string): Promise<void>;
  countByExtractionId(extractionId: string): Promise<number>;
}
