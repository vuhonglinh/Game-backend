import { ConfigService } from '@nestjs/config';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserType } from 'src/@types/auth.type';


// Đúng vậy! JwtStrategy trong NestJS chủ yếu được sử dụng để xác thực token JWT và kiểm tra tính hợp lệ của nó. Cụ thể, nó thực hiện các nhiệm vụ sau:
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>("JWT_SECRET")
        });
    }

    // Khi JwtStrategy xác minh thành công và hàm validate trả về thông tin người dùng, thông tin này sẽ được Passport đính kèm vào request dưới dạng request.user.
    async validate({ _id, email, name }: UserType) {
        return { _id, email, name };
    }
}