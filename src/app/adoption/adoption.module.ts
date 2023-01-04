import { Module } from '@nestjs/common';
import { AdoptionService } from './service/adoption.service';
import { AdoptionController } from './controller/adoption.controller';
import { DatabaseModule } from '../../database/database.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [AdoptionController],
  providers: [AdoptionService],
})
export class AdoptionModule {}
