import { Injectable } from '@nestjs/common';
import { CohereClient } from 'cohere-ai';

export type EmbeddingInputType = 'search_document' | 'search_query';

export type RerankDocument = {
  id: string;
  text: string;
};

export type RerankedDocument = RerankDocument & {
  relevanceScore: number;
};

const COHERE_EMBED_MODEL = 'embed-v4.0';
const COHERE_RERANK_MODEL = 'rerank-v4.0-pro';

@Injectable()
export class AiService {
  private readonly cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
  });

  async embed(text: string, inputType: EmbeddingInputType): Promise<number[]> {
    if (!text.trim()) {
      return [];
    }

    const response = await this.cohere.v2.embed({
      model: COHERE_EMBED_MODEL,
      texts: [text],
      inputType,
      embeddingTypes: ['float'],
    });

    return response.embeddings.float?.[0] ?? [];
  }

  embedDocument(text: string): Promise<number[]> {
    return this.embed(text, 'search_document');
  }

  embedQuery(text: string): Promise<number[]> {
    return this.embed(text, 'search_query');
  }

  async rerank(
    query: string,
    documents: RerankDocument[],
    topN = 10,
  ): Promise<RerankedDocument[]> {
    if (!query.trim() || documents.length === 0) {
      return [];
    }

    const response = await this.cohere.v2.rerank({
      model: COHERE_RERANK_MODEL,
      query,
      documents: documents.map((document) => document.text),
      topN: Math.min(topN, documents.length),
    });

    return response.results.map((result) => ({
      ...documents[result.index],
      relevanceScore: result.relevanceScore,
    }));
  }
}
