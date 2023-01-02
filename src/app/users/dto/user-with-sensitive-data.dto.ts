import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { UserEntity } from '../entities/user.entity';

export class UserWithSensitiveDataDto implements Partial<UserEntity> {
  @Expose()
  @IsNotEmpty()
  email?: UserEntity['email'];

  @IsNotEmpty()
  @Expose()
  password: UserEntity['password'];

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

  constructor(params: Partial<UserEntity>) {
    this.email = params?.email;
    this.password = params?.password;
    this.emailStatus = params?.emailStatus;
    this.id = params?.id;
    this.role = params?.role;
    this.name = params?.name;
    this.picture = params?.picture;
  }
}
