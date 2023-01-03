import { Module } from '@nestjs/common';
import { AdoptionService } from './adoption.service';
import { AdoptionController } from './adoption.controller';
import { DatabaseModule } from '../../database/database.module';
import { UsersService } from '../users/users.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AdoptionController],
  providers: [AdoptionService, UsersService],
})
export class AdoptionModule {}
