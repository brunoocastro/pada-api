import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './app/users/users.module';
import { AuthModule } from './app/auth/auth.module';
import { MailModule } from './app/mail/mail.module';
import { MailService } from './app/mail/service/mail.service';

@Module({
  imports: [ConfigModule.forRoot(), UsersModule, AuthModule, MailModule],
  providers: [MailService],
})
export class AppModule {}
