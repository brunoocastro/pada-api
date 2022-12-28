import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { Global } from '@nestjs/common/decorators';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [MailService],
  exports: [HttpModule, MailService],
})
export class MailModule {}
