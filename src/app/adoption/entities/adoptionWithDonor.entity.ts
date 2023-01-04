import { UserEntity } from '../../users/entities/user.entity';
import { AdoptionEntity } from './adoption.entity';

export class AdoptionWithDonorEntity extends AdoptionEntity {
  donor: Partial<UserEntity>;
}
