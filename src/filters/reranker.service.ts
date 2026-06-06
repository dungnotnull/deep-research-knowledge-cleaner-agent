import { Injectable, Logger } from '@nestjs/common';
import { RawDocument } from '../crawlers/types';

export interface RerankResult {
  doc: RawDocument;
  score: number;
  breakdown: {
    semantic: number;
    authority: number;
    freshness: number;
  };
}

@Injectable()
export class CrossEncoderRerankerService {
  private readonly logger = new Logger(CrossEncoderRerankerService.name);

  async rerank(query: string, docs: RawDocument[]): Promise<RerankResult[]> {
    this.logger.log(\Applying Cross-Encoder Reranking for query: \\);

    const results = await Promise.all(docs.map(async (doc) => {
      // Real run: call Python service wrapping BAAI/bge-reranker-large
      // const semanticScore = await this.pythonService.post('/rerank', { query, text: doc.contentMarkdown });
      const semantic = this.mockSemanticScore(query, doc.contentMarkdown);
      
      const authority = this.calculateAuthorityScore(doc);
      const freshness = this.calculateFreshnessScore(doc);
      
      // Final formula as per spec: 0.5*sem + 0.3*auth + 0.2*fresh
      const finalScore = (0.5 * semantic) + (0.3 * authority) + (0.2 * freshness);
      
      return {
        doc,
        score: finalScore,
        breakdown: { semantic, authority, freshness }
      };
    }));

    return results.sort((a, b) => b.score - a.score);
  }

  private mockSemanticScore(query: string, content: string): number {
    // Simulated semantic similarity
    return Math.random() * 0.4 + 0.6; 
  }

  private calculateAuthorityScore(doc: RawDocument): number {
    let score = 0.5;
    
    // 1. Source Type Priority
    if (doc.sourceType === 'paper') score += 0.4;
    else if (doc.sourceType === 'docs') score += 0.3;
    else if (doc.sourceType === 'github') score += 0.3;

    // 2. Metadata Boosts (GitHub Stars, Paper Citations)
    const stars = doc.rawMetadata?.stars || 0;
    const citations = doc.rawMetadata?.citations || 0;
    
    if (stars > 1000) score += 0.1;
    else if (stars > 100) score += 0.05;
    
    if (citations > 50) score += 0.1;

    return Math.min(score, 1.0);
  }

  private calculateFreshnessScore(doc: RawDocument): number {
    if (!doc.publishDate) return 0.5;
    
    const pubDate = new Date(doc.publishDate);
    const now = new Date();
    const monthsDiff = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    // Exponential decay: half-life of 18 months
    return Math.exp(-monthsDiff / 18);
  }
}
