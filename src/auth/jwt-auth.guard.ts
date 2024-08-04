import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "src/decorators/customize";


@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    // Reflector có thể lấy được metadata được gắn vào các route 
    constructor(private reflector: Reflector) {//Reflector là một lớp trong NestJS được sử dụng để truy xuất metadata đã được gắn vào các lớp, 
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        return super.canActivate(context);
    }
}
