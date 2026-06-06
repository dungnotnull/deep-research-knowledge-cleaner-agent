import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ResearchOrchestratorService } from './research-orchestrator.service';

@Controller('api/research')
export class ResearchController {
  constructor(private readonly orchestrator: ResearchOrchestratorService) {}

  @Post('start')
  async start(@Body() body: { topic: string }) {
    const sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
    // In real run, this would be async/backgrounded
    return await this.orchestrator.runFullPipeline(body.topic, sessionId);
  }

  @Get(':id')
  async getStatus(@Param('id') id: string) {
    return { id, status: 'completed', progress: 100 };
  }
}
