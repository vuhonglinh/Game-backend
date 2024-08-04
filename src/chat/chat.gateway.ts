import { UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserType } from 'src/@types/auth.type';
import { WsJwtGuard } from 'src/guards/socket.guard';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    client.leave(client.data.roomId);
    this.server.to(client.data.roomId).emit('userLeft', client.data.user);
    this.updateRoomUsers(client.data.roomId);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody("roomId") roomId: string,
    @ConnectedSocket() client: Socket
  ) {
    client.join(roomId);
    client.data.roomId = roomId;  // Lưu trữ roomId trong dữ liệu của client
    this.server.to(roomId).emit('userJoined', client.data.user);
    this.updateRoomUsers(roomId);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody("roomId") roomId: string,
    @ConnectedSocket() client: Socket
  ) {
    client.leave(roomId);
    this.server.to(roomId).emit('userLeft', client.data.user);
    this.updateRoomUsers(roomId);
  }



  private updateRoomUsers(roomId: string) {
    // const room = this.
    //   this.server.to(roomId).emit('updateUsers', users);
  }
}

