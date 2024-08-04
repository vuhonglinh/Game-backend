import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client: Socket = context.switchToWs().getClient<Socket>();
            const authToken = client.handshake?.auth?.token as string;

            if (!authToken) {
                throw new WsException('No authentication token found');
            }

            const user = await this.jwtService.verify(authToken);
            client.data.user = user;
            return Boolean(user);
        } catch (err) {
            throw new WsException('No authentication token found');
        }
    }
}
