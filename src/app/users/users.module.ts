import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { DatabaseModule } from '../../database/database.module';
import { UsersService } from './service/users.service';
import { UsersController } from './controller/users.controller';

@Module({
  imports: [MailModule, DatabaseModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
