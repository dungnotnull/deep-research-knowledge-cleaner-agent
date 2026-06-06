import { Test, TestingModule } from '@nestjs/testing';
import { ResearchOrchestratorService } from '../src/research-orchestrator.service';
import { KeywordExpanderService } from '../src/agents/keyword-expander.service';
import { CrawlManagerService } from '../src/crawlers/crawl-manager.service';
import { HardRejectionService } from '../src/filters/hard-rejection.service';
import { AISlopDetectorService } from '../src/filters/ai-slop-detector.service';
import { CrossEncoderRerankerService } from '../src/filters/reranker.service';
import { ChromaAdapter } from '../src/vectordb/chroma.adapter';
import { SynthesisAgentService } from '../src/synthesis/synthesis.service';
import { KnowledgeBrainService } from '../src/knowledge-brain/knowledge-brain.service';
import { ResearchGateway } from '../src/research-gateway';
import { LLMProvider } from '../src/llm/types';
import { ClaudeProvider } from '../src/llm/claude.provider';

describe('Research Pipeline E2E', () => {
  let orchestrator: ResearchOrchestratorService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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
        { provide: LLMProvider, useClass: ClaudeProvider },
      ],
    }).compile();

    orchestrator = module.get(ResearchOrchestratorService);
  });

  const benchmarkTopics = [
    'Domain Driven Design in NestJS',
    'BGE-M3 Embedding Model Architecture',
    'RAG vs Long-Context LLMs',
    'Distributed Tracing in Microservices',
    'Agentic Workflows with LangGraph'
  ];

  benchmarkTopics.forEach(topic => {
    it(\should successfully process topic: \\, async () => {
      const sessionId = 'test-session-' + Math.random().toString(36).substr(2, 9);
      const result = await orchestrator.runFullPipeline(topic, sessionId);
      
      expect(result).toBeDefined();
      expect(result.status).toBe('completed');
      expect(result.report).toBeDefined();
      expect(result.sourceCount).toBeLessThanOrEqual(50);
    });
  });
});
