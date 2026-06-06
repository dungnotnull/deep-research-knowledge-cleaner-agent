import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class ResearchGateway {
  private readonly logger = new Logger(ResearchGateway.name);
  @WebSocketServer() server: Server;

  async emitProgress(sessionId: string, stage: string, progress: number) {
    this.logger.log(\Progress Update [\]: \ - \%\);
    this.server.to(sessionId).emit('progress', { stage, progress });
  }

  @SubscribeMessage('join_session')
  handleJoinSession(@MessageBody() data: { sessionId: string }) {
    this.server.sockets.join(data.sessionId);
    this.logger.log(\Client joined session: \\);
  }
}
