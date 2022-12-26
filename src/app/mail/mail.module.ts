import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  imports: [HttpModule],
  providers: [MailService],
  exports: [HttpModule, MailService],
})
export class MailModule {}
