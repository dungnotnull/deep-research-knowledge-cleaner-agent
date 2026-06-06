import { Injectable, Logger } from '@nestjs/common';
import { RawDocument, CrawlJob } from './types';
import axios from 'axios';

@Injectable()
export class CrawlManagerService {
  private readonly logger = new Logger(CrawlManagerService.name);

  async startCrawl(job: CrawlJob): Promise<RawDocument[]> {
    this.logger.log(\Starting crawl session: \\);
    
    // In a real run, this would call the Python crawl4ai service
    // const response = await axios.post('http://localhost:8000/crawl', job);
    // return response.data;

    // Mocking result for resource saving
    return [
      {
        id: 'doc-1',
        url: 'https://arxiv.org/abs/123',
        title: 'Deep Research Optimization',
        contentMarkdown: '# Deep Research\\n\\nThis is a high quality academic paper about research...',
        wordCount: 1500,
        sourceType: 'paper',
        crawledAt: new Date().toISOString(),
        rawMetadata: {}
      },
      {
        id: 'doc-2',
        url: 'https://medium.com/ai-slop',
        title: 'Why AI Slop is Bad',
        contentMarkdown: 'In today\'s fast-paced world, it is important to note that AI slop is a game-changer...',
        wordCount: 200,
        sourceType: 'blog',
        crawledAt: new Date().toISOString(),
        rawMetadata: {}
      }
    ];
  }
}
