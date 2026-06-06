export interface VectorDBPort {
  upsertDocuments(sessionId: string, docs: any[]): Promise<void>;
  query(query: string, limit: number): Promise<any[]>;
  clearSession(sessionId: string): Promise<void>;
}
