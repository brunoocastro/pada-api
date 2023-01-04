import { CreateAdoptionDto } from '../dto/create-adoption.dto';
import { UpdateAdoptionDto } from '../dto/update-adoption.dto';
import { AdoptionEntity } from '../entities/adoption.entity';
import { AdoptionWithDonorEntity } from '../entities/adoptionWithDonor.entity';
import { AdoptionQueryParams } from '../interfaces/DefaultQueryParams.interface';

export abstract class AdoptionRepository {
  abstract findById(
    id: AdoptionEntity['id'],
    canSeeDonorInfo: boolean,
  ): Promise<Partial<AdoptionEntity>>;

  abstract count(
    params: AdoptionQueryParams,
    donorId?: string,
  ): Promise<number>;

  abstract findAll(
    canSeeDonorInfo: boolean,
    params: AdoptionQueryParams,
  ): Promise<AdoptionWithDonorEntity[]>;

  abstract findAllPerUser(
    userId: string,
    params: AdoptionQueryParams,
  ): Promise<AdoptionEntity[]>;

  abstract create(
    donorId: string,
    adoption: CreateAdoptionDto,
  ): Promise<AdoptionEntity>;

  abstract updateById(
    id: AdoptionEntity['id'],
    updatedAdoption: UpdateAdoptionDto,
  ): Promise<AdoptionEntity>;

  abstract deleteById(id: AdoptionEntity['id']): Promise<void>;
}
