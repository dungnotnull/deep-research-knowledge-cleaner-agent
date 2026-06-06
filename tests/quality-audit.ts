import { AISlopDetectorService } from '../src/filters/ai-slop-detector.service';
import { CrossEncoderRerankerService } from '../src/filters/reranker.service';
import { RawDocument } from '../src/crawlers/types';

async function runQualityAudit() {
  console.log('--- DRKC Quality Audit ---');
  
  const slopDetector = new AISlopDetectorService();
  const reranker = new CrossEncoderRerankerService();

  // 1. Slop Detector Test Set
  const testDocs = [
    { id: 'good-1', contentMarkdown: 'Detailed technical analysis of BGE-M3 with code examples...', wordCount: 1000, sourceType: 'paper' },
    { id: 'slop-1', contentMarkdown: 'In today\'s fast-paced world, it is a game-changer to unlock the power of...', wordCount: 400, sourceType: 'blog' }
  ];

  console.log('\nTesting AI Slop Detector:');
  for (const doc of testDocs) {
    const { score } = await slopDetector.calculateSlopScore(doc as RawDocument);
    console.log(\Doc \ | Score: \ | \\);
  }

  // 2. Reranking Consistency
  console.log('\nTesting Reranker Distribution:');
  const query = 'NestJS Architecture';
  const results = await reranker.rerank(query, testDocs as RawDocument[]);
  results.forEach((r, i) => {
    console.log(\Rank \: \ | Score: \\);
  });
}

runQualityAudit();
