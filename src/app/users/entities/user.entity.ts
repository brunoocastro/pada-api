export class UserEntity {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  birth: Date;
  picture?: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}
