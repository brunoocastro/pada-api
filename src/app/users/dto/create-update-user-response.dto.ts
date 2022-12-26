import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { UserEntity } from '../entities/user.entity';

export class CreateOrUpdateUserResponseDto implements Partial<UserEntity> {
  @Expose()
  @IsNotEmpty()
  name: UserEntity['name'];

  @Expose()
  @IsNotEmpty()
  picture: UserEntity['picture'];

  @Expose()
  @IsNotEmpty()
  emailStatus: UserEntity['emailStatus'];

  @Expose()
  @IsNotEmpty()
  id: UserEntity['id'];
}
