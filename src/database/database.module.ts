import { Module } from '@nestjs/common';
import { UsersRepository } from '../app/users/users.repository';
import { PrismaService } from './prisma.service';
import { UserPrismaRepository } from './repositories/user.repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: UsersRepository,
      useClass: UserPrismaRepository,
    },
  ],
  exports: [UsersRepository],
})
export class DatabaseModule {}
