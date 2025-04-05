import {
  Logger,
  UseFilters,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketExceptionFilter } from 'src/common/filters/socket-exception/socket-exception.filter';
import { ConversationsService } from 'src/conversations/conversations.service';
import { JwtPayload } from 'src/types/jwt-payload.type';

@UseFilters(SocketExceptionFilter)
@WebSocketGateway({
  cors: {
    origin: new ConfigService().get<string>('FRONTEND_URL'),
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('ChatGateway');

  constructor(
    private readonly jwtService: JwtService,
    private readonly conversationsService: ConversationsService,
  ) {}

  afterInit() {
    this.logger.log(`Initialized`);
  }

  async handleConnection(socket: Socket) {
    try {
      const user = this.authenticateSocket(socket);
      await this.initializeUserConnection(user, socket);
    } catch (error) {
      this.handleConnectionError(socket, error);
    }
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client id:${client.id} disconnected`);
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(client: Socket, conversationId: string) {
    const user = client.data.user;

    const conversation = await this.conversationsService.getConversation(
      user.userId,
      conversationId,
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    client.join(conversation.id);
    this.logger.log(
      `Client id: ${client.id} joined conversation: ${conversationId}`,
    );
  }

  @SubscribeMessage('sendDirectMessage')
  async handleDirectMessage(
    client: Socket,
    payload: { conversationId: string; message: string },
  ) {
    const user = client.data.user;
    const currentUserId = user.userId;

    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${payload}`);

    const conversation = await this.conversationsService.getConversation(
      user.userId,
      payload.conversationId,
    );

    if (!conversation) {
      throw new UnauthorizedException('Not part of this conversation');
    }

    const newMessage = await this.conversationsService.createMessage(
      payload.conversationId,
      currentUserId,
      payload.message,
    );

    this.server.to(payload.conversationId).emit('message', newMessage);
  }

  private authenticateSocket(socket: Socket): JwtPayload {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }
      return this.jwtService.verify<JwtPayload>(token);
    } catch (error) {
      this.logger.error(`Error authenticating socket: ${error}`);
      socket.disconnect();
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async initializeUserConnection(user: JwtPayload, socket: Socket) {
    socket.data.user = user;
    this.logger.log(`Client connected: ${socket.id} user: ${user.userId}`);
  }

  private handleConnectionError(socket: Socket, error: Error): void {
    this.logger.error(
      `Connection error for socket ${socket.id}: ${error.message}`,
    );
    socket.emit('exception', 'Authentication error');
    socket.disconnect();
  }
}
