import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { LLMProvider } from '../llm/llm.provider';
import { z } from 'zod';

const BrainEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  confidence: z.enum(['High', 'Medium', 'Low']),
  domain: z.string(),
  learning: z.string(),
  implication: z.string(),
});

export interface BrainEntry {
  id: string;
  title: string;
  dateAdded: string;
  source: string;
  confidence: 'High' | 'Medium' | 'Low';
  domain: string;
  learning: string;
  implication: string;
}

@Injectable()
export class KnowledgeBrainService {
  private readonly logger = new Logger(KnowledgeBrainService.name);
  private readonly brainPath = path.join(process.cwd(), 'SECOND-KNOWLEDGE-BRAIN.md');

  constructor(private readonly llm: LLMProvider) {}

  async updateBrainFromSession(sessionId: string, top50: any[], report: any) {
    this.logger.log(\Extracting durable learnings from session \\);

    const context = \
      Session ID: \
      Executive Summary: \
      Takeaways: \
    \;

    const prompt = \
      Analyze the following research session output and extract 1-3 "Durable Learnings".
      A durable learning is a topic-agnostic principle (e.g., "Cross-encoders are better for precision than bi-encoders").
      
      Context: \

      Return a JSON array of entries adhering to:
      { "id": "SKB-XXX", "title": "...", "confidence": "...", "domain": "...", "learning": "...", "implication": "..." }
    \;

    try {
      const response = await this.llm.completeStructured<BrainEntry[]>(prompt, z.array(BrainEntrySchema));
      
      const entries: BrainEntry[] = response.content.map(e => ({
        ...e,
        dateAdded: new Date().toISOString().split('T')[0],
        source: sessionId
      }));

      await this.persistEntries(entries);
    } catch (error) {
      this.logger.error(\Brain update failed: \\);
    }
  }

  private async persistEntries(entries: BrainEntry[]) {
    let content = '';
    entries.forEach(entry => {
      content += \
### [\] \
- **Date Added:** \
- **Source Session / Paper:** \
- **Confidence:** \
- **Domain:** \
- **Learning:** \
- **Actionable Implication:** \
\n---\n\;
    });

    fs.appendFileSync(this.brainPath, content);
    this.logger.log(\Successfully appended \ entries to the Knowledge Brain.\);
  }
}
