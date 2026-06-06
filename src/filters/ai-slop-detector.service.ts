import { Injectable, Logger } from '@nestjs/common';
import { RawDocument } from '../crawlers/types';

export interface SlopFeatures {
  fillerRatio: number;
  entropy: number;
  codeDensity: number;
  authorPresence: boolean;
  compressionRatio: number;
}

@Injectable()
export class AISlopDetectorService {
  private readonly logger = new Logger(AISlopDetectorService.name);

  private readonly FILLER_PHRASES = [
    'In today\'s fast-paced world',
    'It\'s important to note that',
    'At its core',
    'Game-changer',
    'Unlock the power of',
    'Dive deep into',
    'Revolutionizing the way',
    'Tapestry of',
    'Cutting-edge',
    'Paradigm shift'
  ];

  async calculateSlopScore(doc: RawDocument): Promise<{ score: number, features: SlopFeatures }> {
    const content = doc.contentMarkdown;
    const text = content.toLowerCase();
    
    // 1. Filler Phrase Analysis
    const phraseMatches = this.FILLER_PHRASES.filter(p => text.includes(p.toLowerCase())).length;
    const fillerRatio = phraseMatches / this.FILLER_PHRASES.length;

    // 2. Code Density (Critical for technical content)
    const codeBlocks = (content.match(/\\\/g) || []).length;
    const codeDensity = codeBlocks / (doc.wordCount / 500); // Blocks per 500 words

    // 3. Metadata Validation
    const authorPresence = !!(doc.author || doc.rawMetadata?.author);

    // 4. Compression Ratio (Zlib simulation)
    // High compression = repetitive, predictable AI patterns
    const compressionRatio = this.simulateCompressionRatio(text);

    // Weighting:
    // - Filler: 30%
    // - Code Density: 30% (absence increases score)
    // - Author: 20% (absence increases score)
    // - Compression: 20%
    
    let score = 0;
    score += fillerRatio * 0.3;
    score += (codeDensity < 0.1 ? 0.3 : 0);
    score += (!authorPresence ? 0.2 : 0);
    score += (compressionRatio > 0.65 ? 0.2 : 0);

    return {
      score: Math.min(score, 1.0),
      features: {
        fillerRatio,
        entropy: 0.5, // Simplified
        codeDensity,
        authorPresence,
        compressionRatio
      }
    };
  }

  private simulateCompressionRatio(text: string): number {
    // In a real run, we'd use zlib.compress(text).length / text.length
    // For this implementation, we simulate based on repetitive phrase patterns
    const uniqueWords = new Set(text.split(/\s+/)).size;
    const totalWords = text.split(/\s+/).length;
    return 1 - (uniqueWords / totalWords);
  }

  async filterSlop(docs: RawDocument[]): Promise<RawDocument[]> {
    const filtered = [];
    for (const doc of docs) {
      const { score } = await this.calculateSlopScore(doc);
      if (score < 0.65) {
        filtered.push(doc);
      } else {
        this.logger.warn(\Document \ rejected as AI-Slop (Score: \)\);
      }
    }
    return filtered;
  }
}
