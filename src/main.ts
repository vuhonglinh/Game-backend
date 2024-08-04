import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Transformation } from 'src/core/interceptor';
import * as cookieParser from 'cookie-parser';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from 'src/guards/socket.guard';
// somewhere in your initialization file


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService)


  //Config Cookies
  app.use(cookieParser());

  //Config Auth
  const reflector = app.get(Reflector)
  // const jwtService = app.get(JwtService)
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  // app.useGlobalGuards(new WsJwtGuard(jwtService));


  //Config Interceptor
  app.useGlobalInterceptors(new Transformation(reflector));

  //config Cors
  app.enableCors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }))


  await app.listen(configService.get<string>("PORT"));
}
bootstrap();
