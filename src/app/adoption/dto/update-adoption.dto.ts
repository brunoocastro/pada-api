import { PartialType } from '@nestjs/mapped-types';
import { Exclude, Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { AdoptionEntity } from '../entities/adoption.entity';
import { CreateAdoptionDto } from './create-adoption.dto';

export class UpdateAdoptionDto extends PartialType(CreateAdoptionDto) {
  @Exclude()
  donorId: AdoptionEntity['donorId'];

  @Expose()
  @IsOptional()
  adoptionState: AdoptionEntity['adoptionState'];
}
