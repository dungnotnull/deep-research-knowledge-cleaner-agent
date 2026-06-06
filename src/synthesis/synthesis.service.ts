import { Injectable, Logger } from '@nestjs/common';
import { RawDocument } from '../crawlers/types';
import { LLMProvider } from '../llm/llm.provider';
import { z } from 'zod';

const SynthesisSchema = z.object({
  executiveSummary: z.string(),
  taxonomy: z.record(z.string(), z.array(z.string())), // Category -> List of Doc IDs
  practitionerTakeaways: z.array(z.string()),
  criticalContradictions: z.array(z.string()),
  annotatedBibliography: z.record(z.string(), z.string()), // Doc ID -> Summary
});

export interface SynthesisReport {
  executiveSummary: string;
  taxonomy: Record<string, RawDocument[]>;
  practitionerTakeaways: string[];
  criticalContradictions: string[];
  fullCitations: RawDocument[];
}

@Injectable()
export class SynthesisAgentService {
  private readonly logger = new Logger(SynthesisAgentService.name);

  constructor(private readonly llm: LLMProvider) {}

  async generateReport(sessionId: string, top50: RawDocument[]): Promise<SynthesisReport> {
    this.logger.log(\Generating comprehensive synthesis for session \\);

    // 1. Map documents to basic metadata for the LLM context
    const docContext = top50.map(d => \ID: \ | Title: \ | Snippet: \\).join('\\n');

    const prompt = \
      You are a master technical synthesizer. Analyze these top 50 high-quality sources and generate a definitive research report.
      
      ### SOURCES:
      \

      ### REQUIREMENTS:
      1. Categorize sources into: Fundamentals, Architecture, Code Examples, Case Studies, and Research Papers.
      2. Extract key insights and identify any direct contradictions between authoritative sources.
      3. Provide actionable "Practitioner's Takeaways".
      4. Create an annotated bibliography.

      Return ONLY a JSON object adhering to the provided schema.
    \;

    try {
      const response = await this.llm.completeStructured<typeof SynthesisSchema>(prompt, SynthesisSchema);
      const data = response.content;

      // Resolve Doc IDs back to full documents
      const resolvedTaxonomy: Record<string, RawDocument[]> = {};
      for (const [category, ids] of Object.entries(data.taxonomy)) {
        resolvedTaxonomy[category] = ids.map(id => top50.find(d => d.id === id));
      }

      return {
        executiveSummary: data.executiveSummary,
        taxonomy: resolvedTaxonomy,
        practitionerTakeaways: data.practitionerTakeaways,
        criticalContradictions: data.criticalContradictions,
        fullCitations: top50
      };
    } catch (error) {
      this.logger.error(\Synthesis failed: \\);
      throw error;
    }
  }
}
