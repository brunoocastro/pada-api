import { PartialType } from '@nestjs/swagger';
import { UserEntity } from '../../users/entities/user.entity';
import { AdoptionEntity } from './adoption.entity';

export class AdoptionWithDonorEntity extends PartialType(AdoptionEntity) {
  donor: Partial<UserEntity>;
}
