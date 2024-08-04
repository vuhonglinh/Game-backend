import { ResponseMessage, User } from 'src/decorators/customize';
import { CaroService } from './caro.service';
import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserType } from 'src/@types/auth.type';
import { CreateCaroDto } from 'src/caro/dto/create-caro.dto';


@Controller("caro")
export class CaroController {
    constructor(private readonly caroService: CaroService) { }

    @Get()
    listRooms() {
        return this.caroService.listRooms();
    }

    @Post()
    @ResponseMessage("Thêm phòng thành công")
    createRoom(
        @Body() body: CreateCaroDto,
        @User() user: UserType
    ) {
        return this.caroService.createRoom(body, user);
    }
}