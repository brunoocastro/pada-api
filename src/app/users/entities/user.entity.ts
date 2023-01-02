import { EmailStatus, Role, User } from '@prisma/client';
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
  emailStatus: EmailStatus;
  @Expose()
  role: Role;

  @Exclude()
  password: string;

  constructor(user: Partial<UserEntity>) {
    this.id = user?.id;
    this.createdAt = user?.createdAt;
    this.updatedAt = user?.updatedAt;
    this.email = user?.email;
    this.name = user?.name;
    this.picture = user?.picture;
    this.emailStatus = user?.emailStatus ?? 'UNVERIFIED';
    this.role = user?.role ?? 'USER';
    this.password = user?.password;
  }
}
