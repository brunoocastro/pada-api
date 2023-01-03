import { PartialType } from '@nestjs/mapped-types';
import { Exclude } from 'class-transformer';
import { AdoptionEntity } from '../entities/adoption.entity';
import { CreateAdoptionDto } from './create-adoption.dto';

export class UpdateAdoptionDto extends PartialType(CreateAdoptionDto) {
  @Exclude()
  donorId: AdoptionEntity['donorId'];
}
