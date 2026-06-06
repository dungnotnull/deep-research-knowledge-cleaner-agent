export interface LLMResponse<T> {
  content: T;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface LLMProvider {
  complete(prompt: string): Promise<string>;
  completeStructured<T>(prompt: string, schema: any): Promise<LLMResponse<T>>;
}
