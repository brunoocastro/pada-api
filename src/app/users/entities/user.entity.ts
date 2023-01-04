import { EmailStatus, Role, User } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class UserEntity implements User {
  @Expose()
  @IsNotEmpty()
  id: string;

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsNotEmpty()
  emailStatus: EmailStatus;

  @Expose()
  @IsNotEmpty()
  role: Role;

  @Expose()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsOptional()
  picture: string;

  @Expose()
  @IsMobilePhone(['pt-BR'])
  phone: string;

  @Exclude()
  @IsNotEmpty()
  password: string;

  constructor(user: Partial<UserEntity>) {
    this.id = user?.id;
    this.createdAt = user?.createdAt ?? new Date();
    this.updatedAt = user?.updatedAt ?? new Date();
    this.email = user?.email;
    this.name = user?.name;
    this.picture = user?.picture;
    this.phone = user?.phone;
    this.emailStatus = user?.emailStatus ?? 'UNVERIFIED';
    this.role = user?.role ?? 'USER';
    this.password = user?.password;
  }
}
