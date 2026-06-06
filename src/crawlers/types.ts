export interface RawDocument {
  id: string;
  url: string;
  title: string;
  author?: string;
  publishDate?: string;
  contentMarkdown: string;
  wordCount: number;
  sourceType: 'paper' | 'github' | 'docs' | 'blog' | 'forum';
  rawMetadata: Record<string, any>;
  crawledAt: string;
}

export interface CrawlJob {
  sessionId: string;
  keywordGraph: any;
  maxDocuments: number;
}
