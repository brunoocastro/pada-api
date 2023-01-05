import { ApiHideProperty, ApiProperty, PartialType } from '@nestjs/swagger';
import { AdoptionStates } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { AdoptionEntity } from '../entities/adoption.entity';
import { CreateAdoptionDto } from './create-adoption.dto';

export class UpdateAdoptionDto extends PartialType(CreateAdoptionDto) {
  @Exclude()
  @ApiHideProperty()
  donorId?: AdoptionEntity['donorId'];

  @Expose()
  @IsOptional()
  @IsEnum(AdoptionStates)
  @ApiProperty({ enum: AdoptionStates })
  adoptionState?: AdoptionStates;
}
