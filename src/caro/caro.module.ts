import { Module } from '@nestjs/common';
import { CaroService } from './caro.service';
import { CaroGateway } from './caro.gateway';
import { CaroController } from 'src/caro/caro.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Caro, CaroSchema } from 'src/caro/schemas/caro.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Caro.name, schema: CaroSchema }]),
  ],
  providers: [CaroGateway, CaroService],
  controllers: [CaroController],
})
export class CaroModule { }
