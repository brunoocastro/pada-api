import { Adoption, AdoptionStates, Genders, Prisma } from '@prisma/client';
import { Expose } from 'class-transformer';
import { IsDate, IsJSON, IsNotEmpty, IsOptional } from 'class-validator';

export enum AdoptionStatesEnum {
  MALE,
  FEMALE,
  UNKNOWN,
}

export class AdoptionEntity implements Adoption {
  @Expose()
  @IsNotEmpty()
  id: string;

  @Expose()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @Expose()
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;

  @Expose()
  @IsNotEmpty()
  species: string;

  @Expose()
  @IsOptional()
  breed: string;

  @Expose()
  @IsOptional()
  name: string;

  @Expose()
  @IsJSON()
  pictures: Prisma.JsonValue;

  @Expose()
  @IsNotEmpty()
  gender: Genders;

  @Expose()
  @IsNotEmpty()
  adoptionState: AdoptionStates;

  @Expose()
  @IsNotEmpty()
  donorId: string;

  constructor(params: Partial<AdoptionEntity>) {
    this.id = params?.id;
    this.species = params?.species;
    this.donorId = params?.donorId;
    this.breed = params?.breed;
    this.name = params?.name;
    this.pictures = params?.pictures;
    this.gender = params?.gender;
    this.adoptionState = params?.adoptionState ?? 'INPROGRESS';
    this.createdAt = params?.createdAt ?? new Date();
    this.updatedAt = params?.updatedAt ?? new Date();
  }
}
