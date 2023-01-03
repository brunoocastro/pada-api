import { Expose, Type } from 'class-transformer';
import { IsEnum, IsJSON, IsNotEmpty, IsOptional } from 'class-validator';
import {
  AdoptionEntity,
  AdoptionStatesEnum,
} from '../entities/adoption.entity';

export class CreateAdoptionDto implements Partial<AdoptionEntity> {
  @Expose()
  @IsNotEmpty()
  species: AdoptionEntity['species'];

  @Expose()
  @IsOptional()
  breed: AdoptionEntity['breed'];

  @Expose()
  @IsNotEmpty()
  name: AdoptionEntity['name'];

  @Expose()
  @IsOptional()
  @IsJSON()
  pictures: AdoptionEntity['pictures'];

  @Expose()
  @IsNotEmpty()
  @IsEnum(AdoptionStatesEnum)
  gender: AdoptionEntity['gender'];
}
