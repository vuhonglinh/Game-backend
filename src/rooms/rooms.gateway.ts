import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: '*',
  },
})
@Injectable()
export class RoomsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private server: Server;

  afterInit(server: Server) {
    this.server = server;
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('makeMove')
  handleMove(@MessageBody() data: { roomId: string; x: number; y: number; player: string }): void {
    console.log(data);
    const { roomId, x, y, player } = data;
    this.server.to(roomId).emit('moveMade', { x, y, player });
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket): void {
    console.log(`Joined room: ${roomId}`)
    client.join(roomId);
    this.server.to(roomId).emit('playerJoined', { message: 'A new player has joined the room.' });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket): void {
    client.leave(roomId);
    this.server.to(roomId).emit('playerLeft', { message: 'A player has left the room.' });
  }
}
