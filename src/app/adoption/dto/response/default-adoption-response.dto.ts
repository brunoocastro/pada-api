import { ApiProperty, PartialType } from '@nestjs/swagger';
import { AdoptionEntity } from '../../entities/adoption.entity';

class PartialAdoption extends PartialType(AdoptionEntity) {}

export class SingleAdoptionControllerResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ type: PartialAdoption })
  adoption: PartialAdoption;
}

export class ManyAdoptionsResponseDto<T> {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  page_size: number;

  @ApiProperty({ type: [] })
  registers: Partial<T>[];
}
