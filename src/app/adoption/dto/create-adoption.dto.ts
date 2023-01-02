import { Expose } from 'class-transformer';
import { AdoptionEntity } from '../entities/adoption.entity';

export class CreateAdoptionDto implements Partial<AdoptionEntity> {
  @Expose()
  species: AdoptionEntity['species'];

  @Expose()
  breed: AdoptionEntity['breed'];

  @Expose()
  name: AdoptionEntity['name'];

  @Expose()
  pictures: AdoptionEntity['pictures'];

  @Expose()
  gender: AdoptionEntity['gender'];

  @Expose()
  donorId: AdoptionEntity['donorId'];
}
