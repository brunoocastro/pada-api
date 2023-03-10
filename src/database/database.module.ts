import { Module } from '@nestjs/common';
import { AdoptionRepository } from '../app/adoption/repository/adoption.repository';
import { UsersRepository } from '../app/users/repository/users.repository';
import { PrismaService } from './prisma.service';
import { AdoptionPrismaRepository } from './repositories/adoption.repository';
import { UserPrismaRepository } from './repositories/user.repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: UsersRepository,
      useClass: UserPrismaRepository,
    },
    {
      provide: AdoptionRepository,
      useClass: AdoptionPrismaRepository,
    },
  ],
  exports: [UsersRepository, AdoptionRepository],
})
export class DatabaseModule {}
