import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { UserEntity } from '../../users/entities/user.entity';

export class UserTokenPayloadDto implements Partial<UserEntity> {
  @Expose()
  @IsNotEmpty()
  id: UserEntity['id'];

  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email: UserEntity['email'];

  @Expose()
  @IsNotEmpty()
  name: UserEntity['name'];

  @Expose()
  @IsNotEmpty()
  emailStatus: UserEntity['emailStatus'];

  @Expose()
  @IsOptional()
  picture: UserEntity['picture'];
}
