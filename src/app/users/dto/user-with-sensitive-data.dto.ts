import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { UserEntity } from '../entities/user.entity';
import { UserResponseDto } from './user-response.dto';

export class UserWithSensitiveDataDto extends UserResponseDto {
  @IsNotEmpty()
  @Expose()
  password: UserEntity['password'];
}
