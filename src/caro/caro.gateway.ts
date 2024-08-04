import { JwtService } from '@nestjs/jwt';
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { CaroService } from './caro.service';
import { Server, Socket } from 'socket.io';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/guards/socket.guard';
import { ResponseMessage } from 'src/decorators/customize';
import { UserType } from 'src/@types/auth.type';

@UseGuards(WsJwtGuard)
@WebSocketGateway({ namespace: "caro" })
export class CaroGateway {

  constructor(
    private readonly caroService: CaroService,
    private readonly jwtService: JwtService
  ) { }

  @WebSocketServer() server: Server;

  @SubscribeMessage('addRoom')
  async createRoom(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const res = await this.caroService.createRoom(data, client.data.user);
      this.server.emit("resCreateRoom", res);
      return res;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @SubscribeMessage('sendMessage')
  sendMessage(
    @MessageBody() body: { roomId: string; message: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      this.server.emit(`receiveMessage.${body.roomId}`, { message: body.message, user: client.data.user });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @SubscribeMessage('playChess')
  handleCheck(
    @MessageBody() body: { room: string, rowIndex: number, colIndex: number },
    @ConnectedSocket() client: Socket
  ) {
    try {
      client.join(body.room)
      this.server.to(body.room).emit(`handleCheck`, { ...body, userRes: client.data.user });
    } catch (error) {
      console.error('Error handling playChess:', error);
    }
  }


  afterInit(server: Server) {
    // console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    // console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    client.leave(client.data.roomId);
    this.server.to(client.data.roomId).emit('userLeft', client.data.user);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody("roomId") roomId: string,
    @ConnectedSocket() client: Socket
  ) {
    client.join(roomId);
    client.data.roomId = roomId;  // Lưu trữ roomId trong dữ liệu của client
    const users = await this.caroService.updateAddUserRoom(roomId, client.data.user);
    this.server.to(roomId).emit(`userJoined`, users);
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody("roomId") roomId: string,
    @ConnectedSocket() client: Socket
  ) {
    client.leave(roomId);
    const users = await this.caroService.updateLeaveUserRoom(roomId, client.data.user);
    this.server.to(roomId).emit('userLeft', users);
  }

}
