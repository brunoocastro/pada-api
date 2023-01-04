import { CreateAdoptionDto } from '../dto/create-adoption.dto';
import { UpdateAdoptionDto } from '../dto/update-adoption.dto';
import { AdoptionEntity } from '../entities/adoption.entity';
import { DefaultAdoptionsResponse } from '../interfaces/DefaultAdoptionsResponse.interface';
import { AdoptionQueryParams } from '../interfaces/DefaultQueryParams.interface';

export abstract class AdoptionRepository {
  abstract findById(
    id: AdoptionEntity['id'],
    canSeeDonorInfo: boolean,
  ): Promise<Partial<AdoptionEntity>>;

  abstract findAll(
    canSeeDonorInfo: boolean,
    params: AdoptionQueryParams,
  ): Promise<DefaultAdoptionsResponse<AdoptionEntity>>;

  abstract findAllPerUser(
    userId: string,
    params: AdoptionQueryParams,
  ): Promise<DefaultAdoptionsResponse<AdoptionEntity>>;

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
