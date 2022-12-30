import { MailerModule } from '@nestjs-modules/mailer';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { Global } from '@nestjs/common/decorators';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [
    HttpModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_SMTP_HOST, //host smtp
        secure: false, //regras de segurança do serviço smtp
        port: Number(process.env.MAIL_SMTP_PORT), // porta
        auth: {
          //dados do usuário e senha
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
  exports: [HttpModule, MailService],
})
export class MailModule {}
