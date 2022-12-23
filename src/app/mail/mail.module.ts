import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MailService } from './service/mail.service';

@Module({
  imports: [HttpModule],
  providers: [MailService],
})
export class MailModule {}
