import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { Global } from '@nestjs/common/decorators';
import { MailService } from './service/mail.service';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_SMTP_HOST,
        secure: false,
        port: Number(process.env.MAIL_SMTP_PORT),
        auth: {
          user: process.env.MAIL_SMTP_USERNAME,
          pass: process.env.MAIL_SMTP_PASSWORD,
        },
        ignoreTLS: true,
      },
      defaults: {
        from: 'otonelive@gmail.com',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
