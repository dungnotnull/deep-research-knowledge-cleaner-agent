import { Injectable, Logger } from '@nestjs/common';
import { VectorDBPort } from './types';
import axios from 'axios';

@Injectable()
export class ChromaAdapter implements VectorDBPort {
  private readonly logger = new Logger(ChromaAdapter.name);
  private readonly apiUrl = process.env.CHROMA_URL || 'http://localhost:8001';

  async upsertDocuments(sessionId: string, docs: any[]): Promise<void> {
    this.logger.log(\Upserting \ docs to Chroma for session \\);
    // Mock: axios.post(\\/collections/drkc_docs/add\, { ids, embeddings, metadatas, documents })
  }

  async query(query: string, limit: number): Promise<any[]> {
    this.logger.log(\Querying Chroma for: \\);
    return []; // Mock
  }

  async clearSession(sessionId: string): Promise<void> {
    this.logger.log(\Clearing Chroma session \\);
  }
}
