import { Adoption, AdoptionStates, Genders, Prisma } from '@prisma/client';
import { Expose } from 'class-transformer';

export enum AdoptionStatesEnum {
  MALE,
  FEMALE,
  UNKNOWN,
}

export class AdoptionEntity implements Adoption {
  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  species: string;

  @Expose()
  breed: string;

  @Expose()
  name: string;

  @Expose()
  pictures: Prisma.JsonValue;

  @Expose()
  gender: Genders;

  @Expose()
  adoptionState: AdoptionStates;

  @Expose()
  donorId: string;

  constructor(params: Partial<AdoptionEntity>) {
    this.id = params?.id;
    this.createdAt = params?.createdAt;
    this.updatedAt = params?.updatedAt;
    this.species = params?.species;
    this.breed = params?.breed;
    this.name = params?.name;
    this.pictures = params?.pictures;
    this.gender = params?.gender;
    this.adoptionState = params?.adoptionState ?? 'INPROGRESS';
    this.donorId = params?.donorId;
  }
}
