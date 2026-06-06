import { Injectable, Logger } from '@nestjs/common';
import { KeywordExpanderService } from './agents/keyword-expander.service';
import { CrawlManagerService } from './crawlers/crawl-manager.service';
import { HardRejectionService } from './filters/hard-rejection.service';
import { AISlopDetectorService } from './filters/ai-slop-detector.service';
import { CrossEncoderRerankerService } from './filters/reranker.service';
import { ChromaAdapter } from './vectordb/chroma.adapter';
import { SynthesisAgentService } from './synthesis/synthesis.service';
import { KnowledgeBrainService } from './knowledge-brain/knowledge-brain.service';
import { ResearchGateway } from './research-gateway';

@Injectable()
export class ResearchOrchestratorService {
  private readonly logger = new Logger(ResearchOrchestratorService.name);

  constructor(
    private readonly expander: KeywordExpanderService,
    private readonly crawler: CrawlManagerService,
    private readonly hardFilter: HardRejectionService,
    private readonly slopDetector: AISlopDetectorService,
    private readonly reranker: CrossEncoderRerankerService,
    private readonly vectorDb: ChromaAdapter,
    private readonly synthesis: SynthesisAgentService,
    private readonly brain: KnowledgeBrainService,
    private readonly gateway: ResearchGateway,
  ) {}

  async runFullPipeline(topic: string, sessionId: string) {
    this.logger.log(\\n?? STARTING DEEP RESEARCH: \\);
    
    try {
      // Phase 1: Expansion
      await this.gateway.emitProgress(sessionId, 'Expanding Topic', 10);
      const graph = await this.expander.expandTopic(topic);
      
      // Phase 1: Crawling
      await this.gateway.emitProgress(sessionId, 'Deep Crawling Sources', 30);
      const rawDocs = await this.crawler.startCrawl({ sessionId, keywordGraph: graph, maxDocuments: 100 });
      
      // Phase 2: Hard Filtering
      await this.gateway.emitProgress(sessionId, 'Applying Hard Filters', 40);
      const { accepted: filteredDocs } = await this.hardFilter.filter(rawDocs);
      
      // Phase 2: Slop Detection
      await this.gateway.emitProgress(sessionId, 'Detecting AI Slop', 50);
      const cleanDocs = await this.slopDetector.filterSlop(filteredDocs);
      
      // Phase 2: Reranking
      await this.gateway.emitProgress(sessionId, 'Semantic Reranking (Cross-Encoder)', 70);
      const reranked = await this.reranker.rerank(topic, cleanDocs);
      const top50 = reranked.slice(0, 50).map(r => r.doc);
      
      // Phase 2.3: Vector Ingestion
      await this.gateway.emitProgress(sessionId, 'Indexing to Vector DB', 80);
      await this.vectorDb.upsertDocuments(sessionId, top50);
      
      // Phase 3: Synthesis
      await this.gateway.emitProgress(sessionId, 'Synthesizing Final Report', 90);
      const report = await this.synthesis.generateReport(sessionId, top50);
      
      // Phase 3: Knowledge Brain Update
      await this.gateway.emitProgress(sessionId, 'Updating Knowledge Brain', 95);
      await this.brain.updateBrainFromSession(sessionId, top50, report);
      
      await this.gateway.emitProgress(sessionId, 'Pipeline Complete', 100);
      
      return {
        sessionId,
        report,
        sourceCount: top50.length,
        status: 'completed'
      };
    } catch (error) {
      this.logger.error(\Pipeline Crash: \\);
      await this.gateway.emitProgress(sessionId, 'Error', 0);
      throw error;
    }
  }
}
