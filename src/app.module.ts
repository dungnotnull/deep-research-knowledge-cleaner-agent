import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResearchController } from './research.controller';
import { ResearchOrchestratorService } from './research-orchestrator.service';
import { KeywordExpanderService } from './agents/keyword-expander.service';
import { CrawlManagerService } from './crawlers/crawl-manager.service';
import { HardRejectionService } from './filters/hard-rejection.service';
import { AISlopDetectorService } from './filters/ai-slop-detector.service';
import { CrossEncoderRerankerService } from './filters/reranker.service';
import { ChromaAdapter } from './vectordb/chroma.adapter';
import { SynthesisAgentService } from './synthesis/synthesis.service';
import { KnowledgeBrainService } from './knowledge-brain/knowledge-brain.service';
import { ClaudeProvider } from './llm/claude.provider';
import { LLMProvider } from './llm/types';
import { ResearchGateway } from './research-gateway';

@Module({
  controllers: [AppController, ResearchController],
  providers: [
    AppService,
    ResearchOrchestratorService,
    KeywordExpanderService,
    CrawlManagerService,
    HardRejectionService,
    AISlopDetectorService,
    CrossEncoderRerankerService,
    ChromaAdapter,
    SynthesisAgentService,
    KnowledgeBrainService,
    ResearchGateway,
    { provide: LLMProvider, useClass: ClaudeProvider }
  ],
})
export class AppModule {}
