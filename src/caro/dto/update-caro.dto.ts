import { PartialType } from '@nestjs/mapped-types';
import { CreateCaroDto } from './create-caro.dto';

export class UpdateCaroDto extends PartialType(CreateCaroDto) {
  id: number;
}
