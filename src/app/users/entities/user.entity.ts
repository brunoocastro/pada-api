import { User } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class UserEntity implements User {
  @Expose()
  id: string;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;

  @Expose()
  email: string;
  @Expose()
  name: string;
  @Expose()
  picture: string;
  @Expose()
  emailStatus: User['emailStatus'];
  @Expose()
  role: User['role'];

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
