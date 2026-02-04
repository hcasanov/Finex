import { eq, and, sql } from "drizzle-orm";
import { documents } from "../schema/documents";
import type { Database } from "../connection";
import type {
  IVectorStore,
  DocumentChunkWithEmbedding,
  SimilaritySearchOptions,
  SimilaritySearchResult,
} from "@/application/ports/IVectorStore";

export class PostgresVectorStore implements IVectorStore {
  constructor(private db: Database) {}

  async upsert(chunk: DocumentChunkWithEmbedding): Promise<void> {
    const embeddingJson = JSON.stringify(chunk.embedding);

    await this.db
      .insert(documents)
      .values({
        id: chunk.id,
        extractionId: chunk.extractionId,
        companyId: chunk.companyId,
        content: chunk.content,
        sourceType: chunk.sourceType,
        sourceUrl: chunk.sourceUrl ?? null,
        sourceDate: chunk.sourceDate ?? null,
        chunkIndex: chunk.chunkIndex,
        embedding: embeddingJson,
        metadata: chunk.metadata ?? null,
      })
      .onConflictDoUpdate({
        target: documents.id,
        set: {
          content: chunk.content,
          embedding: embeddingJson,
          metadata: chunk.metadata ?? null,
        },
      });
  }

  async upsertMany(chunks: DocumentChunkWithEmbedding[]): Promise<void> {
    if (chunks.length === 0) return;

    const values = chunks.map((chunk) => ({
      id: chunk.id,
      extractionId: chunk.extractionId,
      companyId: chunk.companyId,
      content: chunk.content,
      sourceType: chunk.sourceType,
      sourceUrl: chunk.sourceUrl ?? null,
      sourceDate: chunk.sourceDate ?? null,
      chunkIndex: chunk.chunkIndex,
      embedding: JSON.stringify(chunk.embedding),
      metadata: chunk.metadata ?? null,
    }));

    // Batch insert in chunks of 100
    const batchSize = 100;
    for (let i = 0; i < values.length; i += batchSize) {
      const batch = values.slice(i, i + batchSize);
      await this.db.insert(documents).values(batch).onConflictDoNothing();
    }
  }

  async similaritySearch(
    queryEmbedding: number[],
    options?: SimilaritySearchOptions
  ): Promise<SimilaritySearchResult[]> {
    const { extractionId, companyId, limit = 5, threshold = 0.5 } = options ?? {};

    // Build where conditions
    const conditions = [];
    if (extractionId) {
      conditions.push(eq(documents.extractionId, extractionId));
    }
    if (companyId) {
      conditions.push(eq(documents.companyId, companyId));
    }

    // Fetch documents with embeddings
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await this.db
      .select({
        id: documents.id,
        extractionId: documents.extractionId,
        companyId: documents.companyId,
        content: documents.content,
        sourceType: documents.sourceType,
        sourceUrl: documents.sourceUrl,
        sourceDate: documents.sourceDate,
        chunkIndex: documents.chunkIndex,
        embedding: documents.embedding,
        metadata: documents.metadata,
      })
      .from(documents)
      .where(whereClause);

    // Calculate cosine similarity in application code
    const results: SimilaritySearchResult[] = [];

    for (const row of rows) {
      if (!row.embedding) continue;

      const docEmbedding = JSON.parse(row.embedding) as number[];
      const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);

      if (similarity >= threshold) {
        results.push({
          chunk: {
            id: row.id,
            extractionId: row.extractionId,
            companyId: row.companyId,
            content: row.content,
            sourceType: row.sourceType,
            sourceUrl: row.sourceUrl,
            sourceDate: row.sourceDate,
            chunkIndex: row.chunkIndex,
            metadata: row.metadata,
          },
          score: similarity,
        });
      }
    }

    // Sort by similarity (descending) and limit
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  async deleteByExtractionId(extractionId: string): Promise<void> {
    await this.db.delete(documents).where(eq(documents.extractionId, extractionId));
  }

  async countByExtractionId(extractionId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents)
      .where(eq(documents.extractionId, extractionId));

    return result[0]?.count ?? 0;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

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

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    if (magnitude === 0) return 0;

    return dotProduct / magnitude;
  }
}
