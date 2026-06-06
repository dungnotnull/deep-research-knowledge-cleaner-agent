import { Injectable, Logger } from '@nestjs/common';
import { KeywordGraph } from './types';
import { LLMProvider } from '../llm/llm.provider';
import { z } from 'zod';

const KeywordGraphSchema = z.object({
  coreTopic: z.string(),
  primaryKeywords: z.array(z.string()),
  adjacentKeywords: z.array(z.string()),
  targetDomains: z.array(z.string()),
  academicSearchQueries: z.array(z.string()),
  githubSearchQueries: z.array(z.string()),
  authorityAuthors: z.array(z.string()),
});

@Injectable()
export class KeywordExpanderService {
  private readonly logger = new Logger(KeywordExpanderService.name);

  constructor(private readonly llm: LLMProvider) {}

  async expandTopic(topic: string): Promise<KeywordGraph> {
    this.logger.log(\Expanding research topic: \\);

    const prompt = \
      You are a senior research architect specializing in knowledge acquisition.
      Your goal is to decompose the research topic "\" into a comprehensive search graph to ensure no critical high-quality sources are missed.

      ### STRATEGY:
      1. Identify core technical terminology and synonyms.
      2. Determine adjacent concepts that provide necessary context.
      3. List the most authoritative domains for this specific topic (e.g., official docs, academic repositories, industry-standard blogs).
      4. Construct precise queries for academic engines (Google Scholar/Semantic Scholar) and GitHub.

      ### OUTPUT FORMAT:
      Return ONLY a JSON object strictly adhering to this schema:
      {
        "coreTopic": string,
        "primaryKeywords": string[], // Exact terms, technical jargon
        "adjacentKeywords": string[], // Broadening the search to related fields
        "targetDomains": string[], // List of domains like "docs.nestjs.com", "arxiv.org"
        "academicSearchQueries": string[], // Boolean search strings for scholarly papers
        "githubSearchQueries": string[], // Advanced GitHub search queries (e.g. "topic:x language:y")
        "authorityAuthors": string[] // Key figures or organizations leading the field
      }
    \;

    try {
      const response = await this.llm.completeStructured<KeywordGraph>(prompt, KeywordGraphSchema);
      
      // Validation
      const validated = KeywordGraphSchema.parse(response.content);
      this.logger.log(\Successfully expanded topic into \ primary keywords.\);
      return validated;
    } catch (error) {
      this.logger.error(\Failed to expand topic: \\);
      throw new Error(\Topic Expansion Failed: \\);
    }
  }
}
