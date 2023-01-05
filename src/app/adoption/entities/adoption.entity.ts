import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Adoption, AdoptionStates, Genders, Prisma } from '@prisma/client';
import { Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { randomUUID } from 'node:crypto';

export class AdoptionEntity implements Partial<Adoption> {
  @Expose()
  @ApiProperty()
  id?: string;

  @Expose()
  @ApiHideProperty()
  createdAt?: Date;

  @Expose()
  @ApiHideProperty()
  updatedAt?: Date;

  @Expose()
  @ApiProperty()
  species: string;

  @Expose()
  @ApiPropertyOptional()
  breed?: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiPropertyOptional({ type: JSON })
  pictures: Prisma.JsonValue;

  @Expose()
  @IsEnum(Genders)
  @ApiProperty({ enum: Genders })
  gender: Genders;

  @Expose()
  @IsEnum(AdoptionStates)
  @ApiProperty({ enum: AdoptionStates })
  adoptionState: AdoptionStates;

  @Expose()
  donorId: string;

  constructor(params: AdoptionEntity) {
    this.id = params?.id ?? randomUUID();

    this.species = params.species;
    this.donorId = params.donorId;
    this.name = params.name;
    this.gender = params.gender;

    this.breed = params?.breed;
    this.pictures = params?.pictures;
    this.adoptionState = params?.adoptionState ?? 'INPROGRESS';
    this.createdAt = params?.createdAt ?? new Date();
    this.updatedAt = params?.updatedAt ?? new Date();
  }
}
