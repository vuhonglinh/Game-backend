import { ResponseMessage } from './../decorators/customize';
import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login.dto';
import { RegisterAuthDto } from 'src/auth/dto/register.dto';
import { RefreshTokenDto } from 'src/auth/dto/refresh-token.dto';
import { Public, User } from 'src/decorators/customize';
import { Response } from 'express';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }


  @Public()
  @Post("login")
  @ResponseMessage("Đăng nhập tài khoản thành công")
  login(@Body() body: LoginAuthDto, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(body, response);
  }

  @Public()
  @ResponseMessage("Đăng ký tài khoản thành công")
  @Post("register")
  register(@Body() createAuthDto: RegisterAuthDto, @Res({ passthrough: true }) response: Response) {
    return this.authService.register(createAuthDto, response);
  }

  @Public()
  @Post("refresh")
  refreshToken(@Res({ passthrough: true }) response: Response) {
    return this.authService.refreshToken(response['refresh_token'], response)
  }


  @Post("logout")
  @ResponseMessage("Đăng xuất tài khản thành công")
  logout(@User() user, @Res({ passthrough: true }) response: Response) {
    return this.authService.logout(user, response)
  }
}
