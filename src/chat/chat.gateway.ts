import { Logger, UnauthorizedException, UseFilters } from '@nestjs/common';
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
import { JwtPayload } from 'src/types/jwt-payload.type';

@UseFilters(SocketExceptionFilter)
@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('ChatGateway');

  constructor(private readonly jwtService: JwtService) {}

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

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any) {
    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${payload}`);

    return {
      event: 'pong',
      data: 'Wrong data that will make the test fail',
    };
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
    console.log(`Client connected: ${socket.id} user: ${user.userId}`);
  }

  private handleConnectionError(socket: Socket, error: Error): void {
    this.logger.error(
      `Connection error for socket ${socket.id}: ${error.message}`,
    );
    socket.emit('exception', 'Authentication error');
    socket.disconnect();
  }
}
