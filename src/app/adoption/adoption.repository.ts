import { CreateAdoptionDto } from './dto/create-adoption.dto';
import { UpdateAdoptionDto } from './dto/update-adoption.dto';
import { AdoptionEntity } from './entities/adoption.entity';

export abstract class AdoptionRepository {
  abstract findById(id: AdoptionEntity['id']): Promise<AdoptionEntity>;
  abstract findAll(): Promise<AdoptionEntity[]>;
  abstract create(adoption: CreateAdoptionDto): Promise<AdoptionEntity>;
  abstract updateById(
    id: AdoptionEntity['id'],
    updatedAdoption: UpdateAdoptionDto,
  ): Promise<AdoptionEntity>;
  abstract deleteById(id: AdoptionEntity['id']): Promise<void>;
}
