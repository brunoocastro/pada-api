import { RegisterUserDto } from '../auth/dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

export abstract class UsersRepository {
  abstract findById(id: UserEntity['id']): Promise<UserEntity>;
  abstract findByEmail(email: UserEntity['email']): Promise<UserEntity>;
  abstract create(user: RegisterUserDto): Promise<UserEntity>;
  abstract updateById(
    id: UserEntity['id'],
    updatedUser: UpdateUserDto,
  ): Promise<UserEntity>;
  abstract deleteById(id: UserEntity['id']): Promise<void>;
}
