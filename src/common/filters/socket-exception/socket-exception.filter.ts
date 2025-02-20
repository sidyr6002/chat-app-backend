import { ArgumentsHost, Catch, WsExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class SocketExceptionFilter implements WsExceptionFilter<WsException> {
  catch(exception: WsException, host: ArgumentsHost): void {
    // Explicitly specify the client type using generics
    const client = host.switchToWs().getClient<Socket>();
    const error = exception.getError();
    client.emit('error', error);
  }
}
