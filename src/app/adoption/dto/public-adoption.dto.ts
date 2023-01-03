import { Exclude, Expose } from 'class-transformer';
import { AdoptionEntity } from '../entities/adoption.entity';

export class PublicAdoptionDto implements Partial<AdoptionEntity> {
  @Expose()
  id: AdoptionEntity['id'];

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
  adoptionState: AdoptionEntity['adoptionState'];

  @Exclude()
  donorId: AdoptionEntity['donorId'];
}
