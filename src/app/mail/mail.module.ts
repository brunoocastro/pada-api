import { HttpModule } from '@nestjs/axios';
import { Module, Global } from '@nestjs/common';
import { MailService } from './service/mail.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [MailService],
  exports: [HttpModule, MailService],
})
export class MailModule {}
