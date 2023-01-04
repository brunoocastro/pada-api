import { EmailStatus, Role, User } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
import { randomUUID } from 'node:crypto';

export class UserEntity implements Partial<User> {
  @Expose()
  id: string;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;

  @Expose()
  email: string;

  @Expose()
  emailStatus: EmailStatus;

  @Expose()
  role: Role;

  @Expose()
  name: string;

  @Expose()
  picture?: string;

  @Expose()
  phone?: string;

  @Exclude()
  password?: string;

  constructor(user: UserEntity) {
    this.createdAt = user?.createdAt ?? new Date();
    this.updatedAt = user?.updatedAt ?? new Date();
    this.picture = user?.picture;
    this.phone = user?.phone;

    this.id = user?.id ?? randomUUID();
    this.email = user?.email;
    this.name = user?.name;
    this.emailStatus = user?.emailStatus;
    this.role = user?.role;

    this.password = user?.password;
  }
}
