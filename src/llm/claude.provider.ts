import { Injectable, Logger } from '@nestjs/common';
import { LLMProvider, LLMResponse } from './types';
import axios from 'axios';

@Injectable()
export class ClaudeProvider implements LLMProvider {
  private readonly logger = new Logger(ClaudeProvider.name);

  async complete(prompt: string): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is missing');

    try {
      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      }, {
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }
      });
      return response.data.content[0].text;
    } catch (error) {
      this.logger.error(\Claude API error: \\);
      throw error;
    }
  }

  async completeStructured<T>(prompt: string, schema: any): Promise<LLMResponse<T>> {
    // Append JSON requirement to prompt
    const structuredPrompt = \\\n\nReturn ONLY valid JSON that matches the provided schema. Do not include any conversational filler.\;
    
    const content = await this.complete(structuredPrompt);
    
    // Basic JSON extraction
    const jsonMatch = content.match(/(\\{[\\s\\S]*\\})/);
    if (!jsonMatch) throw new Error('LLM failed to return a JSON object');
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      content: parsed as T,
      usage: { promptTokens: 0, completionTokens: 0 } // In real run, extract from response.data.usage
    };
  }
}
