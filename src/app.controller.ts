import { Body, Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { Public } from 'src/decorators/customize';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @UseGuards(AuthGuard)
  getHello(@Req() req): string {
    return this.appService.getHello();
  }
}
