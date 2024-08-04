import { IsNotEmpty } from "class-validator";

export class CreateCaroDto {
    @IsNotEmpty()
    name: string;
}
