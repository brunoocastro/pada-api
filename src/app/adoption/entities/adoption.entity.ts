import { Adoption, AdoptionStates, Genders, Prisma } from '@prisma/client';
import { Expose } from 'class-transformer';
import { randomUUID } from 'node:crypto';

export enum AdoptionStatesEnum {
  MALE,
  FEMALE,
  UNKNOWN,
}

export class AdoptionEntity implements Partial<Adoption> {
  @Expose()
  id?: string;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;

  @Expose()
  species: string;

  @Expose()
  breed?: string;

  @Expose()
  name: string;

  @Expose()
  pictures?: Prisma.JsonValue;

  @Expose()
  gender: Genders;

  @Expose()
  adoptionState?: AdoptionStates;

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
