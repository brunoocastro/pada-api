import { IsOptional } from 'class-validator';
import { UserEntity } from '../entities/user.entity';

export class UpdateUserDto implements Partial<UserEntity> {
  @IsOptional()
  name?: UserEntity['name'];

  @IsOptional()
  picture?: UserEntity['picture'];

  @IsOptional()
  emailStatus?: UserEntity['emailStatus'];
}