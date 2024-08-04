// import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
// import { WsException } from '@nestjs/websockets';
// import { Socket } from 'socket.io';
// import { AuthService } from '../auth/auth.service';
// import { UserInfo } from 'os';


// @Injectable()
// export class WsJwtGuard implements CanActivate {
//     private logger: Logger = new Logger(WsJwtGuard.name);

//     constructor(private authService: AuthService) { }

//     async canActivate(context: ExecutionContext): Promise<boolean> {

//         try {
//             const client: Socket = context.switchToWs().getClient<Socket>();
//             const authToken: string = client.handshake?.query?.token;
//             const user: UserInfo = await this.authService.verifyUser(authToken);
//             client.join(`house_${user?.house?.id}`);
//             context.switchToHttp().getRequest().user = user

//             return Boolean(user);
//         } catch (err) {
//             throw new WsException(err.message);
//         }
//     }
// }