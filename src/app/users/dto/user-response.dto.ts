import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { UserEntity } from '../entities/user.entity';

export class UserResponseDto implements Partial<UserEntity> {
  @Expose()
  @IsNotEmpty()
  name: UserEntity['name'];

  @Expose()
  @IsOptional()
  picture: UserEntity['picture'];

  @Expose()
  @IsNotEmpty()
  emailStatus: UserEntity['emailStatus'];

  @Expose()
  @IsNotEmpty()
  id: UserEntity['id'];

  @Expose()
  @IsNotEmpty()
  role: UserEntity['role'];
}
